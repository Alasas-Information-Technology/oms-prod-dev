"use client"
import { Icon } from "@iconify/react";
import { Skeleton} from "../ui/skeleton";
import { useEffect, useState } from "react";

type GenericKpiCardProps = {
  icon: string;
  value: number;
  title: string;
  description?: string;
};

export function GenericKpiCard({
  icon,
  value,
  title,
  description,
}: GenericKpiCardProps) {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
  }, []);

  return (
    <>
    {loading ? (

    <div className="rounded-xl border bg-background p-4 shadow-sm">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <Skeleton className="h-6 w-40 mt-4" />
              <Skeleton className="h-4 w-28 mt-2" />
            </div>
            <Skeleton className="h-13 w-13 rounded-full" />
          </div>
          <Skeleton className="h-10 w-24 mt-8" />
        </div>
) : (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div className="">
        <p className="text-lg font-semibold text-muted-foreground mt-4">{title || ""}</p>
          {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
          
          
        </div>
        <div className="rounded-full bg-primary/10 p-3">
        <Icon icon={icon} className="h-7 w-7 text-primary" />
        </div>
        
          
      
      </div>


        <p className="text-3xl font-bold mt-8">{value || 0}</p>
       
     
    </div>
        )}
    </>
  );
}