"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/login");
    } else {
      setError(data.error || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <Label>Name</Label>
        <Input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <Label>Email</Label>
        <Input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <Label>Password</Label>
        <Input type="password" name="password" value={formData.password} onChange={handleChange} required />

        <Label>Role</Label>
        <select name="role" value={formData.role} onChange={handleChange} className="border p-2 w-full">
          <option value="customer">Customer</option>
          <option value="seller">Seller</option>
        </select>

        <Button type="submit" className="w-full bg-[#69a35f] hover:bg-[#588c4f]">
          Register
        </Button>
      </form>
    </div>
  );
}