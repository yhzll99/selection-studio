import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "选品研习社 · 服饰与宠物", description: "让每一次选品，都有据可依。需求、商品、验证和经验的私有研究工作台。", icons: { icon: "/favicon.svg" } };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {return <html lang="zh-CN"><body>{children}</body></html>}
