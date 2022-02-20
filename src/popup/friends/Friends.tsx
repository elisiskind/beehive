import React from "React";
import { useContext, useState } from "react";
import { DataContext } from "../storage/DataProvider";
import { Button } from "../components/Button";
import { AddFriend } from "./AddFriend";
import { FriendInfo } from "./FriendInfo";
import { createUseStyles } from "react-jss";
import { FriendRequest } from "./FriendRequest";

const useStyles = createUseStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
    gap: 16,
    justifyContent: "flex-start",
    height: "calc(300px - 32px)",
    overflowY: "scroll",
  },
  friendRequests: {
    padding: 16,
    display: "flex",
    gap: 16,
    flexDirection: "column",
    border: "1px solid #dedede",
    margin: 16,
    borderRadius: 16,
    width: "calc(100% - 32px)",
  },
  friends: {
    width: "100%",
  },
});

export const Friends = () => {
  const classes = useStyles();

  const { friends, friendRequests } = useContext(DataContext);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [openFriend, setOpenFriend] = useState<string | null>(null);

  if (friends.length === 0 && friendRequests.length === 0) {
    return (
      <div className={classes.root}>
        {showAddModal ? (
          <AddFriend close={() => setShowAddModal(false)} />
        ) : (
          <></>
        )}
        <div>You have no friends yet.</div>
        <Button size={"large"} onClick={() => setShowAddModal(true)}>
          Add friends
        </Button>
      </div>
    );
  }

  const friendRequestContent =
    friendRequests.length === 0 ? (
      <></>
    ) : (
      <div className={classes.friendRequests}>
        <div>You have pending friend requests!</div>
        {friendRequests.map((req) => (
          <FriendRequest user={req} />
        ))}
      </div>
    );

  const friendsContent =
    friends.length === 0 ? (
      <></>
    ) : (
      <div className={classes.friends}>
        {friends.map((friend) => (
          <FriendInfo
            user={friend}
            active={openFriend === friend.id}
            setActive={setOpenFriend}
          />
        ))}
      </div>
    );

  return (
    <div className={classes.root}>
      {showAddModal ? (
        <AddFriend close={() => setShowAddModal(false)} />
      ) : (
        <></>
      )}
      {friendRequestContent}
      {friendsContent}
      <Button size={"medium"} onClick={() => setShowAddModal(true)}>
        Add friends
      </Button>
    </div>
  );
};
