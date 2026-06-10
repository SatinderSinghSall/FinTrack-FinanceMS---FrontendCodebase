import { View, Text } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { getDaysRemaining } from "@/src/utils/getDaysRemaining";

export default function UpcomingRenewals({ subscriptions }: any) {
  const upcomingSubscriptions = subscriptions
    .filter((item: any) => {
      const daysRemaining = getDaysRemaining(item.nextRenewalDate);

      return daysRemaining <= 7;
    })
    .slice(0, 3);

  return (
    <View className="mt-8">
      {/* HEADER */}

      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-zinc-900 text-2xl font-black">
          Upcoming Renewals
        </Text>

        {upcomingSubscriptions.length > 0 && (
          <Text className="text-indigo-600 font-bold">
            {upcomingSubscriptions.length} upcoming
          </Text>
        )}
      </View>

      {/* EMPTY STATE */}

      {upcomingSubscriptions.length === 0 ? (
        <View className="bg-white border border-zinc-200 rounded-[32px] p-8 items-center">
          {/* ICON */}

          <View className="bg-emerald-100 w-20 h-20 rounded-full items-center justify-center">
            <Ionicons name="checkmark-circle" size={40} color="#059669" />
          </View>

          {/* TEXT */}

          <Text className="text-zinc-900 text-2xl font-black mt-6">
            No Upcoming Renewals
          </Text>

          <Text className="text-zinc-500 text-center leading-7 mt-3">
            You have no subscription renewals in the next 7 days.
          </Text>

          {/* STATUS BADGE */}

          <View className="bg-emerald-100 px-5 py-3 rounded-2xl mt-6">
            <Text className="text-emerald-700 font-black">
              You're all caught up 🎉
            </Text>
          </View>
        </View>
      ) : (
        <>
          {/* LIST */}

          {upcomingSubscriptions.map((item: any) => {
            const daysRemaining = getDaysRemaining(item.nextRenewalDate);

            return (
              <View
                key={item._id}
                className="bg-white border border-zinc-200 rounded-[28px] p-5 mb-4"
              >
                <View className="flex-row items-center justify-between">
                  {/* LEFT */}

                  <View className="flex-row items-center flex-1">
                    {/* ICON */}

                    <View className="bg-indigo-100 w-14 h-14 rounded-2xl items-center justify-center mr-4">
                      <Ionicons name="albums" size={26} color="#4F46E5" />
                    </View>

                    {/* INFO */}

                    <View className="flex-1">
                      <Text className="text-zinc-900 text-lg font-black">
                        {item.name}
                      </Text>

                      <Text className="text-zinc-500 mt-1">
                        {new Date(item.nextRenewalDate).toDateString()}
                      </Text>
                    </View>
                  </View>

                  {/* RIGHT */}

                  <View className="bg-red-100 px-4 py-3 rounded-2xl">
                    <Text className="text-red-500 font-black">
                      {daysRemaining === 0 ? "Today" : `${daysRemaining}d`}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}
