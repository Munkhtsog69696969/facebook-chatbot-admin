"use client";
import React, { useEffect, useState } from "react";
// import Badge from "../ui/badge/Badge";
import { ArrowUpIcon, GroupIcon} from "@/icons";
import { MapPinIcon } from "@/icons/custom-icons";
import { PhoneIcon } from "@/icons/custom-icons";
import { GlobeIcon } from "@/icons/custom-icons";

import Image from "next/image";

export interface PageInfo {
  name: string;
  category: string;
  fan_count: number;
  followers_count: number;
  cover: {
    source: string;
    offset_x: number;
    offset_y: number;
  };
  picture: {
    data: {
      url: string;
      height: number;
      width: number;
    };
  };
  location: {
    city: string;
    country: string;
    street: string;
  };
  phone: string;
  link: string;
}

export const EcommerceMetrics = () => {
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);

  useEffect(() => {
    const fetchPageInfo = async () => {
      try {
        const response = await fetch(
          "https://facebook-chatbot-rj6n.onrender.com/page",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setPageInfo(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchPageInfo();
  }, []);

  if (!pageInfo) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Cover Image and Profile Section */}
      <div className="relative h-64 rounded-2xl overflow-hidden">
        <Image
          src={pageInfo.cover.source}
          alt="Cover"
          fill
          className="object-cover"
        />
        <div className="absolute bottom-4 left-6 border-4 border-white rounded-full overflow-hidden">
          <Image
            src={pageInfo.picture.data.url}
            alt="Profile"
            width={96}
            height={96}
            className="rounded-full"
          />
        </div>
      </div>

      {/* Page Info Section */}
      <div className="pt-16 px-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {pageInfo.name}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {pageInfo.category}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 px-6">
        {/* Followers Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center space-x-3">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
              <p className="text-xl dark:text-gray-400 font-semibold">{pageInfo.followers_count}</p>
            </div>
          </div>
        </div>

        {/* Likes Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center space-x-3">
            <ArrowUpIcon className="text-gray-800 size-6 dark:text-white/90" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Likes</p>
              <p className="text-xl dark:text-gray-400 font-semibold">{pageInfo.fan_count}</p>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="text-gray-800 size-5 dark:text-white/90" />
              <p className="text-sm text-gray-500">{pageInfo.location.city}, {pageInfo.location.country}</p>
            </div>
            <div className="flex items-center space-x-2">
              <PhoneIcon className="text-gray-800 size-5 dark:text-white/90" />
              <p className="text-sm text-gray-500">{pageInfo.phone}</p>
            </div>
            <div className="flex items-center space-x-2">
              <GlobeIcon className="text-gray-800 size-5 dark:text-white/90" />
              <a 
                href={pageInfo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                Visit Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
