import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "IlmSpace - Virtual Islamiyya Spaces",
    description: "A modern Islamic online learning platform for students and teachers.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-[#0a0a0a] text-white antialiased`}>
                <AuthProvider>
                    <div className="min-h-screen">
                        <Navbar />
                        <div className="flex">
                            <Sidebar />
                            <main className="flex-1 lg:ml-64 pt-16 p-6 min-h-[calc(100vh-64px)]">
                                {children}
                            </main>
                        </div>
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}
