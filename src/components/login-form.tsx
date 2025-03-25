"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react"; // Import eye icons
import { useUserRole } from "@/context/userRoleContext";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const { setUserRole } = useUserRole();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [role, setRole] = useState<"customer" | "seller">("customer");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);
        localStorage.setItem("email", data.email);

        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem('authToken', data.token);
        }

        setUserRole(data.role);

        toast.success(`Login successful! Redirecting to ${data.role === "customer" ? "Customer Dashboard" : "Seller Dashboard"}...`);

        setTimeout(() => {
          router.push(data.role === "customer" ? "/customerdashboard" : "/dashboard");
        }, 1500);
      } else {
        toast.error(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderPasswordInput = (idPrefix: string) => (
    <div className="space-y-2 relative">
      <Label htmlFor={`${idPrefix}-password`}>Password</Label>
      <div className="relative">
        <Input
          id={`${idPrefix}-password`}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="pr-10" // Add padding for the eye icon
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-2 top-1/2 -translate-y-1/2 focus:outline-none"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleLogin} {...props}>
      <Tabs defaultValue="customer" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customer" onClick={() => setRole("customer")}>
            Customer Login
          </TabsTrigger>
          <TabsTrigger value="seller" onClick={() => setRole("seller")}>
            Seller Login
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customer">
          <Card>
            <CardHeader>
              <h1 className="text-2xl font-bold">Login as Customer</h1>
              <CardDescription>Enter your details below to log in to your account</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer-email">Email</Label>
                <Input
                  id="customer-email"
                  type="email"
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {renderPasswordInput("customer")}

              <Button type="submit" className="w-full bg-[#69a35f] hover:bg-[#588c4f]" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seller">
          <Card className="bg-[#f5f8fa]">
            <CardHeader>
              <h1 className="text-2xl font-bold">Login as Seller</h1>
              <CardDescription>Enter your details below to log in to your account</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seller-email">Email</Label>
                <Input
                  id="seller-email"
                  type="email"
                  placeholder="seller@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {renderPasswordInput("seller")}

              <Button type="submit" className="w-full bg-[#69a35f] hover:bg-[#588c4f]" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline underline-offset-4 hover:text-customtext-green">
          Sign up
        </Link>
      </div>
    </form>
  );
}

export default LoginForm;