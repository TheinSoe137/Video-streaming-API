import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;
  if (!channelId) throw new ApiError(400, "channel id missing");

  try {
    const existingSubscriber = await Subscription.findOne({
      subscriber: userId,
      channel: channelId,
    });
    if (existingSubscriber) {
      await Subscription.findOneAndDelete(existingSubscriber._id);
      return res
        .status(202)
        .json(
          new ApiResponse(202, null, "Channel Unsubscribed Successfully!!!")
        );
    } else {
      const newSub = await Subscription.create({
        subscriber: userId,
        channel: channelId,
      });
      return res
        .status(201)
        .json(
          new ApiResponse(201, newSub, "Channel Subscribe Successfully!!!")
        );
    }
  } catch (error) {
    throw new ApiError(500, error.message, "Failed to Toggle Subscription");
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) throw new ApiError(400, "channel id missing");
  try {
    const subscribers = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscriberDetails",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$subscriberDetails",
      },
      {
        $project: {
          subscriberDetails: 1,
          _id: 1,
          channel: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    const subscriberList = subscribers.map((sub) => sub.subscriberDetails);
    return res
      .status(200)
      .json(
        new ApiResponse(200, subscriberList, "Subscribers fetched successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message,
      "Failed to Fetch Channel Subscribers"
    );
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscriberId = req.user._id;
  if (!subscriberId) throw new ApiError(400, "subscriber id missing");
  try {
    const channels = await Subscription.aggregate([
      [
        {
          $match: {
            subscriber: new mongoose.Types.ObjectId(subscriberId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "channel",
            foreignField: "_id",
            as: "channelDetails",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  username: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$channelDetails",
        },
        {
          $project: {
            channelDetails: 1,
            _id: 1,
            subscriber: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ],
    ]);
    const channelList = channels.map((channel) => channel.channelDetails);
    return res
      .status(200)
      .json(new ApiResponse(200, channelList, "Subbed fetched successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message,
      "Failed to Fetch  Subscriber Channels"
    );
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
