import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useAdminLogin();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    loginMutation.mutate({ data: values }, {
      onSuccess: (data) => {
        localStorage.setItem("adminToken", data.token);
        toast({
          title: "Login Successful",
          description: "Welcome back.",
        });
        setLocation("/admin");
      },
      onError: () => {
        toast({
          title: "Login Failed",
          description: "Invalid username or password.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-secondary items-center justify-center">
        <img 
          src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200" 
          alt="Luxury Car" 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 text-center px-8">
          <div className="flex flex-col mb-6">
            <span className="font-serif text-5xl font-bold tracking-wider text-white">AUTOELITE</span>
            <span className="text-primary text-sm font-semibold tracking-[0.3em] uppercase">MOTORS</span>
          </div>
          <p className="text-gray-400 text-lg">Admin Portal Access</p>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-card border border-white/5 p-8 rounded-lg shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <h1 className="font-serif text-2xl font-bold text-center text-white mb-2">Secure Login</h1>
          <p className="text-center text-gray-400 mb-8 text-sm">Enter your credentials to access the admin dashboard.</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" className="bg-background border-white/10 text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="bg-background border-white/10 text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 uppercase tracking-widest font-bold" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Authenticating..." : "Login"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
