import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";

type StatCardProps = {
  title: React.ReactNode;
  value: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
  className?: string;
  titleClassName?: string;
  valueClassName?: string;
  iconWrapperClassName?: string;
  navigateTo?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  color,
  loading = false,
  className,
  titleClassName,
  valueClassName,
  iconWrapperClassName,
  navigateTo,
}: StatCardProps) {
  const navigation = useNavigate();
  const isClickable = Boolean(navigateTo) && !loading;

  return (
    <Card
      className={cn(
        "sm:p-5 px-3 py-2 rounded-md text-white border-none",
        isClickable ? "cursor-pointer" : "cursor-default",
        className,
        color,
      )}
      onClick={() => isClickable && navigation(navigateTo as string)}
    >
      {loading ? (
        <div className="flex items-center justify-between animate-pulse">
          <div className="space-y-2 w-full">
            <div className="h-3 w-24 rounded bg-white/35" />
            <div className="h-6 w-20 rounded bg-white/45" />
          </div>

          <div className="bg-white/65 sm:p-2 p-1 rounded-md">
            <div className="size-7 rounded bg-white/80" />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p
              className={cn("md:text-base text-xs opacity-90", titleClassName)}
            >
              {title}
            </p>
            <p
              className={cn(
                "md:text-2xl text-base mt-1 w-17.5 sm:w-auto overflow-y-hidden overflow-x-auto",
                valueClassName,
              )}
            >
              {value}
            </p>
          </div>

          <div
            className={cn(
              "bg-white sm:p-2 p-1 rounded-md",
              iconWrapperClassName,
            )}
          >
            {icon}
          </div>
        </div>
      )}
    </Card>
  );
}
