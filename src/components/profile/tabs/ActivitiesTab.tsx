import { Calendar, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ActivitiesTab() {
  const activities = [
    {
      type: "speed_dating",
      icon: Activity,
      title: "Speed Dating",
      date: "Vendredi 24 janvier 2025",
      time: "20h00",
    },
    {
      type: "love_room",
      icon: Calendar,
      title: "Love Room Secret (Rideaux Ouverts)",
      date: "Jeudi 23 janvier 2025",
      time: "16h00 - 17h00",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {activities.map((activity, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-pink-100 p-2">
                <activity.icon className="h-5 w-5 text-burgundy" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-burgundy">
                  {activity.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {activity.date} • {activity.time}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}