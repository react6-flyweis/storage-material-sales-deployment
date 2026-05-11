import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";

type StatCardProps = {
  title: string | React.ReactNode;
  value: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  className?: string;
  navigateTo?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  color,
  className,
  navigateTo,
}: StatCardProps) {
  const navigation = useNavigate();
  return (
    <Card
      className={cn(
        "sm:p-5 px-3 py-2 rounded-md text-white border-none cursor-pointer",
        className,
        color,
      )}
      onClick={() => navigateTo && navigation(navigateTo)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="md:text-base text-xs opacity-90">{title}</p>
          <p className="md:text-2xl text-base mt-1 w-[70px] sm:w-auto overflow-y-hidden overflow-x-auto">
            {value}
          </p>
        </div>

        <div className="bg-white sm:p-2 p-1 rounded-md">{icon}</div>
      </div>
    </Card>
  );
}
