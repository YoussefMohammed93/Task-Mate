"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Trophy } from "lucide-react";
import { useQuery } from "convex/react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LeaderboardPage() {
  const user = useQuery(api.users.currentUser);
  const leaderboardData = useQuery(api.leaderboard.getLeaderboard);
  const isLoading = !leaderboardData || !user;
  const leaderboard = leaderboardData?.leaderboard || [];
  const totalUsers = leaderboardData?.totalUsers || 0;
  const sortedLeaderboard = leaderboard.sort((a, b) => b.points - a.points);
  const normalizeUserId = (id: string) => id.split("|")[0];

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "text-yellow-500";
      case 1:
        return "text-gray-500";
      case 2:
        return "text-amber-600";
      default:
        return "";
    }
  };

  const getBadgeColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-500/10 text-yellow-500";
      case 1:
        return "bg-gray-500/10 text-gray-500";
      case 2:
        return "bg-amber-600/10 text-amber-600";
      default:
        return "";
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Leaderboard</CardTitle>
          {!isLoading && (
            <div className="flex gap-2">
              <Badge variant="outline">Total Users: {totalUsers}</Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-5">
        <div className="w-full overflow-auto">
          <div className="min-w-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Skeleton className="h-5 w-5" />
                            <Skeleton className="h-5 w-10" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-[150px]" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[60px]" />
                        </TableCell>
                        <TableCell className="flex justify-end">
                          <Skeleton className="h-4 w-12" />
                        </TableCell>
                      </TableRow>
                    ))
                  : sortedLeaderboard.map((entry, index) => {
                      const isCurrentUser =
                        normalizeUserId(entry.userId) ===
                        normalizeUserId(user?.userId || "");
                      const currentRank = index + 1;
                      return (
                        <TableRow
                          key={entry.userId}
                          className={isCurrentUser ? "bg-muted/75" : undefined}
                        >
                          <TableCell
                            className={`font-medium ${getRankColor(index)} whitespace-nowrap`}
                          >
                            <div className="flex items-center gap-2">
                              {currentRank <= 3 && (
                                <Trophy className="w-4 h-4" />
                              )}
                              <span>#</span>
                              {currentRank}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Image
                                src={entry.imageUrl || "/avatar.png"}
                                alt=""
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                              <span className="font-medium">
                                {`${entry.firstName} ${entry.lastName}`}
                              </span>
                              {isCurrentUser && (
                                <Badge variant="default">You</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={getBadgeColor(index)}
                            >
                              Level {entry.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono whitespace-nowrap">
                            {entry.points.toLocaleString()} pts
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
