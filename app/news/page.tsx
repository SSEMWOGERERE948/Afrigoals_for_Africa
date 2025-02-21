"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import type { News } from "../types";

export default function NewsPage() {
  const news: News[] = [
    {
      id: "1",
      title: "Sundowns extend unbeaten run in CAF Champions League",
      summary: "Mamelodi Sundowns continue their impressive form...",
      content: "Full article content here...",
      image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800",
      date: "2024-02-23",
      category: "CAF Champions League"
    },
    {
      id: "2",
      title: "Nigeria's Super Eagles prepare for upcoming qualifiers",
      summary: "The Nigerian national team begins training camp...",
      content: "Full article content here...",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
      date: "2024-02-22",
      category: "International"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Latest News</h1>
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All News</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="matches">Match Reports</TabsTrigger>
          <TabsTrigger value="international">International</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <div className="text-sm text-muted-foreground mb-2">
                {item.category} • {item.date}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.summary}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}