import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { User2 } from 'lucide-react';

interface DecodedToken {
  userId: string;
  role: string;
  username?: string;
  name?: string;
}

const TopBar = () => {
  const [userInfo, setUserInfo] = useState<{ name?: string; username?: string; role?: string }>({});

  useEffect(() => {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (token) {
      try {
        // Decode the token to get user information
        const decoded: DecodedToken = jwtDecode(token);
        
        // Set the user information
        setUserInfo({
          name: decoded.name,
          username: decoded.username,
          role: decoded.role
        });
      } catch (error) {
        console.error('Error decoding token:', error);
        setUserInfo({});
      }
    }
  }, []);

  // Determine what to display - prefer name, then username, then generic user
  const displayName = userInfo.name || userInfo.username || 'User';
  const userDisplay = userInfo.name && userInfo.username 
    ? `${userInfo.name} (${userInfo.username})`
    : displayName;

  return (
    <>
      {/* Background Image */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "14%",
          zIndex: 5,
        }}
      >
        <Image
          src="/images/topbaber.png" 
          alt="Static Background"
          layout="fill"
          objectFit="cover"
        />
      </div>

      {/* Logo on the Left */}
      <div
        style={{
          position: "fixed",
          top: "10px",
          left: "20px",
          zIndex: 20,
        }}
      >
        <Link href="/dashboard">
          <Image
            src="/images/habibi new logo hor.png"
            alt="Habibi Logo"
            width={300}
            height={300}
          />
        </Link>
      </div>

      {/* User Display on the Top Right */}
      {userDisplay && (
        <div 
          className="fixed top-8 right-12 z-20 flex items-center space-x-2 bg-[#6a7457] backdrop-md rounded-lg shadow-lg px-4 py-2 text-white"
        >
          <User2 className="w-6 h-6 text-white" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">
              {userDisplay}
            </span>
            {userInfo.role && (
              <span className="text-xs text-white/75 capitalize">
                {userInfo.role}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;