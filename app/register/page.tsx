"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Theater } from "lucide-react";

const programs = [
  "MFA in Ensemble-Based Physical Theatre",
  "Summer Intensive",
  "Professional Training Program",
  "International Summer School",
  "Pedagogy Program",
]

const graduationYears = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

export default function CompleteProfilePage() {
  const [program, setProgram] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !graduationYear) {
      setError("Please select both your program and graduation year.");
      return;
    }
    setLoading(true);
    setError("");

    // Call our new API route to save the data
    const response = await fetch('/api/users/create-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program, graduationYear }),
    });

    if (response.ok) {
      // Success! Send them to their dashboard.
      router.push("/alumni/dashboard");
    } else {
      // Handle errors from our API
      const data = await response.json();
      setError(data.error || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>One Last Step!</CardTitle>
          <CardDescription>Tell us about your time at Dell'Arte.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            
            <div className="space-y-2">
              <Label htmlFor="program">Program Attended</Label>
              <Select value={program} onValueChange={setProgram}>
                <SelectTrigger><SelectValue placeholder="Select your program" /></SelectTrigger>
                <SelectContent>
                  {programs.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="graduationYear">Graduation Year</Label>
              <Select value={graduationYear} onValueChange={setGraduationYear}>
                <SelectTrigger><SelectValue placeholder="Select graduation year" /></SelectTrigger>
                <SelectContent>
                  {graduationYears.map((y) => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}