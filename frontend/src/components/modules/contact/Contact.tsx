"use client";

import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mb-14 text-center">
          <span className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium">
            Contact Us
          </span>

          <h2 className="mt-5 text-4xl font-bold">Get in Touch</h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Have questions regarding admissions, academics, departments, or
            student services? Feel free to contact us and our team will respond
            as soon as possible.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h3 className="mb-8 text-2xl font-semibold">Contact Information</h3>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>

                <div>
                  <h4 className="font-semibold">Address</h4>
                  <p className="text-muted-foreground">
                    School of Engineering
                    <br />
                    Far Western University
                    <br />
                    Kanchanpur, Nepal
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Phone className="h-6 w-6" />
                </div>

                <div>
                  <h4 className="font-semibold">Phone</h4>
                  <p className="text-muted-foreground">+977-9766987980</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Mail className="h-6 w-6" />
                </div>

                <div>
                  <h4 className="font-semibold">Email</h4>
                  <p className="text-muted-foreground">
                    engineering@example.com
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Clock className="h-6 w-6" />
                </div>

                <div>
                  <h4 className="font-semibold">Office Hours</h4>
                  <p className="text-muted-foreground">
                    Monday – Friday
                    <br />
                    9:00 AM – 5:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h3 className="mb-8 text-2xl font-semibold">Send a Message</h3>

            <form className="space-y-5">
              <Input placeholder="Full Name" />

              <Input type="email" placeholder="Email Address" />

              <Input placeholder="Subject" />

              <Textarea placeholder="Write your message..." rows={6} />

              <Button className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
