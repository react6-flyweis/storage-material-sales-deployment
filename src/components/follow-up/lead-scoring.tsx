import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { useScoredLeadsQuery } from "@/modules/leads/leads.hooks";
import { Badge } from "@/components/ui/badge";

interface LeadScore {
  id: string;
  name: string;
  location: string;
  score: number;
  scoreLabel: "Hot" | "Warm" | "Cold";
}

function LeadScoringSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-gray-50 rounded-md p-4"
        >
          <div className="space-y-2">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-3 w-32 bg-slate-200 rounded" />
          </div>
          <div className="space-y-2 text-right">
            <div className="h-4 w-12 bg-slate-200 rounded ml-auto" />
            <div className="w-24 h-2 bg-slate-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LeadScoringEmptyState() {
  return (
    <div className="text-center py-6">
      <p className="text-sm text-slate-600">No scored leads found</p>
    </div>
  );
}

export default function LeadScoring() {
  const {
    data: scoredResp,
    isLoading,
    isError,
    refetch,
  } = useScoredLeadsQuery(1, 4);

  const leads: LeadScore[] = (scoredResp?.data?.leads || []).map((l) => {
    const scoreNum = l.leadScoring?.score ?? 0;
    const scoreLabel: LeadScore["scoreLabel"] =
      scoreNum >= 70 ? "Hot" : scoreNum >= 40 ? "Warm" : "Cold";

    return {
      id: l._id,
      name: l.customerId?.firstName || "Unknown",
      location: l.projectName || "N/A",
      score: scoreNum,
      scoreLabel,
    };
  });

  const getScoreBadgeClass = (score: string) => {
    switch (score) {
      case "Hot":
        return "bg-red-50 text-red-600";
      case "Warm":
        return "bg-yellow-50 text-yellow-700";
      case "Cold":
        return "bg-blue-50 text-blue-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const getProgressWidth = (score: number) => {
    return Math.min(100, Math.max(0, score));
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between border-b">
        <div>
          <CardTitle>🎯 Lead Scoring</CardTitle>
          <CardDescription>Top performing leads</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium">
              {leads.length} leads
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        {isError ? (
          <div className="text-center py-6">
            <p className="text-sm text-red-600 mb-2">Failed to load leads</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <LeadScoringSkeleton />
        ) : leads.length === 0 ? (
          <LeadScoringEmptyState />
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center justify-between bg-gray-50 rounded-md p-4"
            >
              <div>
                <div className="flex items-center space-x-3">
                  <Badge className={getScoreBadgeClass(lead.scoreLabel)}>
                    {lead.scoreLabel.toLowerCase()}
                  </Badge>
                  <div className="font-medium text-gray-900">{lead.name}</div>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {lead.location}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{lead.score}</div>
                <div className="w-24 h-2 bg-gray-200 rounded mt-2">
                  <div
                    className="h-2 bg-blue-600 rounded"
                    style={{ width: `${getProgressWidth(lead.score)}%` }}
                  />
                </div>
                <div className="text-sm text-blue-600 mt-1">Follow Up</div>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <CardFooter className="justify-center border-t">
        <Link to="/leads/follow-up/scoring">
          <Button variant="link">
            View All Lead Scores
            <ArrowRight />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
