import Aside from "@/components/Aside";
import GlobalNotifications from "@/components/GlobalNotifications";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <GlobalNotifications />
        <Aside></Aside>
        <main>{children}</main>
    </>
  );
}
