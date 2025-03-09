"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash } from "lucide-react";
import Image from "next/image";
import type { News } from "@/app/types";

export default function NewsAdmin() {
  const [news, setNews] = useState<News[]>([
    {
      id: "1",
      title: "Sundowns extend unbeaten run in CAF Champions League",
      summary: "Mamelodi Sundowns continue their impressive form...",
      content: "Full article content here...",
      image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800",
      date: "2024-02-23",
      category: "CAF Champions League"
    }
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">News Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Article
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Article</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label>Title</label>
                <Input />
              </div>
              <div className="grid gap-2">
                <label>Summary</label>
                <Input />
              </div>
              <div className="grid gap-2">
                <label>Content</label>
                <textarea
                  className="min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-2">
                <label>Category</label>
                <Input />
              </div>
              <div className="grid gap-2">
                <label>Image URL</label>
                <Input />
              </div>
            </div>
            <Button className="w-full">Publish Article</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Article</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="relative h-16 w-24">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{article.title}</div>
                      <div className="text-sm text-muted-foreground">{article.summary}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{article.category}</TableCell>
                <TableCell>{article.date}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-600">
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}