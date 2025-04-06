
import { useAuth } from "@/contexts/AuthContext";
import { SearchBar } from "./SearchBar";
import { UserProfile } from "./UserProfile";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function Header() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>Agile Customer AI</span>
          </h1>
          <div className="hidden md:flex">
            <SearchBar />
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-support-high"></span>
              </Button>
              <UserProfile />
            </>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" disabled={isLoading}>
                  {isLoading ? "Loading..." : "Sign In / Sign Up"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Account Access</DialogTitle>
                  <DialogDescription>
                    Sign in to your account or create a new one.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login" className="mt-4">
                    <LoginForm />
                  </TabsContent>
                  <TabsContent value="signup" className="mt-4">
                    <SignUpForm />
                  </TabsContent>
                </Tabs>
                <div className="text-center text-sm mt-4 text-muted-foreground">
                  <p>Demo accounts:</p>
                  <p className="font-mono">admin@example.com / password</p>
                  <p className="font-mono">agent@example.com / password</p>
                  <p className="font-mono">demo@example.com / demo123</p>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  );
}
