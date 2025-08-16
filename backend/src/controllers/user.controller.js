import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';


export async function getRecommendedUsers(req, res){
    try{
        const currentUserId = req.user._id;
        const currentUser = req.user ;

        const recommendedUsers = await User.find({
            $and: [
                { _id : { $ne : currentUserId }} , // apne aap ko sugest nhi karna 
                { _id : {$nin : currentUser.friends }} ,   // jo uske friend m already h unko suggest nhi karna 
                { isOnboarded : true } ,   // onboarded user ho hona chahiye like usi format m hona chaiye jiske andar language native sab kuch hoga
            ],
        });
        res.status(200).json(recommendedUsers);
    }
    catch (error) {
        console.error("Error fetching recommended users:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user._id)
        .select('friends')
        .populate('friends', 'fullname profilePic nativeLanguage learningLanguage');

        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error fetching friends:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function sendFriendRequest(req, res){
    try {
        const myId = req.user._id ;
        const { id: recipientId } = req.params ;

        // prevent sending req to yourself
        if(myId.toString() === recipientId) {
            return res.status(400).json({ message : "You cannot send a friend request to yourself." });
        }
        const recipient = await User.findById(recipientId) ;
        if(!recipient){
            return res.status(404).json({ message: "Recipient not found." });
        }

        // check if user is already friends
        if(recipient.friends.includes(myId)){
            return res.status(400).json({ message: "You are already friends with this user." });

        }

        // check if a req already exists
        const existingRequest = await FriendRequest.findOne({
            status: "pending",
            $or : [
                { sender : myId , recipient : recipientId} ,
                {sender : recipientId , recipient : myId},

            ],
        });
        if(existingRequest) {
            return res.status(400).json({ message: "Friend request already exists between you and this user." });
        }
        const friendRequest = new FriendRequest({
            sender : myId, 
            recipient : recipientId,
        });
        await friendRequest.save();
        console.log("Friend request sent:", friendRequest);
        res.status(201).json(friendRequest);

    }catch(error) {
            console.error("Error sending friend request:", error.message);
            return res.status(500).json({ message: "Internal server error" });
        }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // add each user to the other's friends array
    // $addToSet: adds elements to an array only if they do not already exist.
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
    try {
        const incomingReqs = await FriendRequest.find({
            recipient : req.user._id,
            status: "pending"
        }).populate('sender', 'fullname profilePic nativeLanguage learningLanguage');

        const acceptedReqs = await FriendRequest.find({
            sender : req.user._id,
            status : "accepted"
        }).populate('recipient', 'fullname profilePic nativeLanguage learningLanguage');

        res.status(200).json({ incomingReqs, acceptedReqs });
    } catch (error) {
        console.error("Error fetching friend requests:", error.message);
        return res.status(500).json({ message: "Internal server error" });

    }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user._id,
      status: "pending",
    }).populate("recipient", "fullname profilePic nativeLanguage learningLanguage");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}