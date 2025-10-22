
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { updateProfile, createUserWithEmailAndPassword, sendEmailVerification, reload, type User } from 'firebase/auth';
import { Loader2, MailCheck } from 'lucide-react';


import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function SignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isWaitingForVerification, setIsWaitingForVerification] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  React.useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(userCredential.user, { displayName: values.name });
      
      await sendEmailVerification(userCredential.user);

      toast({
        title: 'Verification Email Sent',
        description: 'Please check your inbox to verify your email.',
      });
      
      setIsWaitingForVerification(true);

      // Poll for email verification
      const interval = setInterval(async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
          await reload(currentUser);
          if (currentUser.emailVerified) {
            clearInterval(interval);
            toast({
              title: 'Email Verified!',
              description: "You're now logged in.",
            });
            // The onAuthStateChanged listener in the provider will handle the redirect
            // after the user object is updated.
          }
        }
      }, 3000); // Check every 3 seconds
      
    } catch (error: any) {
      console.error('Signup Error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign-up Failed',
        description: error.code === 'auth/email-already-in-use' ? 'This email is already in use.' : 'An unexpected error occurred.',
      });
      setIsSubmitting(false);
    }
    // isSubmitting will be managed by the verification state
  }
  
  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle>{isWaitingForVerification ? 'Verify Your Email' : 'Create an Account'}</CardTitle>
        <CardDescription>
          {isWaitingForVerification 
            ? "We've sent a verification link to your email. Please check your inbox and click the link to continue."
            : 'Enter your information to create an account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isWaitingForVerification ? (
           <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
            <MailCheck className="w-16 h-16 text-primary" />
            <p className="text-muted-foreground">Waiting for verification...</p>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             <p className="text-xs text-muted-foreground pt-4">
              Once verified, you will be logged in automatically.
            </p>
          </div>
        ) : (
          <>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          {...field}
                        />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Account
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Log In
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
