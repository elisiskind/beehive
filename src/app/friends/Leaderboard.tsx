import React from "React";
import { useContext, useState } from "react";
import { DataContext } from "../storage/DataProvider";
import { Button } from "../components/Button";
import { AddFriend } from "./AddFriend";
import { FriendInfo } from "./FriendInfo";
import { createUseStyles } from "react-jss";
import { FriendRequest } from "./FriendRequest";
import { Rank } from "../../lib/interfaces";
import { getRank, getScore } from "./scoring";

const useStyles = createUseStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
    gap: 16,
    justifyContent: "flex-start"
  },
  noFriends: {
    height: "calc(var(--vh, 1vh) * 64 + 60px)",
    display: "flex",
    flexDirection: 'column',
    alignItems: "center",
    justifyContent: "center",
    gap: 32
  },
  friendRequests: {
    padding: 16,
    display: "flex",
    gap: 16,
    flexDirection: "column",
    border: "1px solid #dedede",
    margin: 16,
    borderRadius: 16,
    width: "calc(100% - 32px)"
  },
  friends: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 4
  }
});

export interface LeaderBoardFriend {
  id: string;
  name: string;
  score: number;
  rank: Rank;
  pangram: boolean;
  guesses: string[];
  photo: string;
  isMe: boolean;
}

export const Leaderboard = () => {
  const classes = useStyles();

  const { friends, friendRequests, user, gameInfo, guesses } = useContext(DataContext);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [openFriend, setOpenFriend] = useState<string | null>(null);

  if (friends.length === 0 && friendRequests.length === 0) {
    return (
      <div className={classes.noFriends}>
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

  const foundPangram = (guesses: string[]) => {
    for (let pangram of gameInfo.pangrams) {
      if (guesses.includes(pangram)) {
        return true;
      }
    }
    return false;
  };

  const sortedFriends = [...friends, user]
    .map((friend): LeaderBoardFriend => {
      const isMe = user.id === friend.id;
      const friendGuesses = isMe ? guesses : friend.guesses[gameInfo.id] ?? [];
      const score = getScore(friendGuesses, gameInfo.pangrams);
      const rank = getRank(score, gameInfo.answers, gameInfo.pangrams);

      return {
        id: friend.id,
        photo: friend.photo,
        name: friend.name ?? friend.email ?? friend.id,
        pangram: foundPangram(friendGuesses),
        rank,
        score,
        guesses: friendGuesses,
        isMe
      };
    })
    .sort((friendA, friendB) => {
      return friendB.score - friendA.score;
    });

  const friendsContent =
    friends.length === 0 ? (
      <></>
    ) : (
      <div className={classes.friends}>
        {sortedFriends.map((friend) => {
          return (
            <FriendInfo
              {...{
                ...friend,
                ...{
                  active: openFriend === friend.id,
                  setActive: setOpenFriend
                }
              }}
            />
          );
        })}
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
