import { getNotifications } from "@/lib/settle/api";
import { NotificationsClient } from "./notifications-client";

export const metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return <NotificationsClient notifications={notifications} />;
}
