import { useEffect, useState } from "react";
import { getChallenges } from "../api"; // adjust path if needed
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

export default function Dashboard() {
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getChallenges();
        setChallenges(data);
      } catch (err) {
        console.error("Failed to fetch challenges:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">🚀 DevOpsBox Challenges</h1>
      
      {challenges.length === 0 ? (
        <p className="text-gray-500">Loading challenges...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((ch) => (
            <Card key={ch.id} className="rounded-2xl shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <CardTitle>{ch.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="secondary">{ch.difficulty}</Badge>
                  <Badge className={ch.status === "Completed" ? "bg-green-500" : "bg-blue-500"}>
                    {ch.status}
                  </Badge>
                </div>
                <Button className="w-full" variant="default">
                  <Play className="mr-2 h-4 w-4" /> Start
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
