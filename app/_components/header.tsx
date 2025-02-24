"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import HeaderItem from "./header-login";
import swarmOs from "@/app/_public/swarmOPS-text-lime@4x.png";
import swarmOsSquare from "@/app/_public/swarmOPS-500x500-transparent@4x.png";
// import MenuList from "./layout/MenuList";

const PlainHeader = () => {
  //   const [collapsed, setCollapsed] = useState(true);
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  return (
    <div>
      <header className="fixed top-0 left-0 right-0 h-16 backdrop-blur-md z-50 px-2 md:px-8 lg:px-14">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-4">
            <div
              onMouseEnter={() => setSidebarVisible(true)}
              onMouseLeave={() => setSidebarVisible(false)}
              onClick={() => setSidebarVisible(true)}
            >
              {typeof window !== "undefined" && window.innerWidth <= 768 ? (
                <Image src={swarmOsSquare} alt={"swarmOs"} width={50} />
              ) : (
                <Image src={swarmOs} alt={"swarmOs"} width={80} />
              )}
            </div>
          </div>
          <div>
            <HeaderItem />
          </div>
        </div>
      </header>
      <div
        className={`fixed left-0 h-full w-50 bg-zinc-900 transform transition-transform duration-300 ease-in-out z-50 pt-4 ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
        onMouseEnter={() => setSidebarVisible(true)}
        onMouseLeave={() => setSidebarVisible(false)}
      >
        <div className="md:px-8 lg:px-14 px-5 mb-5">
          <Link href="/">
            <Image src={swarmOs} alt="swarmOs" width={80} />
          </Link>
        </div>
        {/* <MenuList sider={{ collapsed: false }} showIcons={true} /> */}
      </div>

      {typeof window !== "undefined" &&
        window.innerWidth <= 768 &&
        isSidebarVisible && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setSidebarVisible(false)}
          ></div>
        )}
    </div>
  );
};

export default PlainHeader;
