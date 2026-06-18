import React from "react";

export default function DeleteAccount() {
  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Chef App Account Deletion Request
        </h1>

        <p className="mb-4">
          Users can request deletion of their Chef App account and associated
          personal data.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          How to Request Account Deletion
        </h2>

        <p className="mb-4">
          Send an email to:
        </p>

        <p className="font-semibold text-lg mb-4">
          support@chefapp.com
        </p>

        <p className="mb-4">
          Subject: <strong>Account Deletion Request</strong>
        </p>

        <p className="mb-4">
          Please include your registered email address and full name.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          Data That Will Be Deleted
        </h2>

        <ul className="list-disc ml-6 mb-4">
          <li>Account information</li>
          <li>Profile information</li>
          <li>Menu information</li>
          <li>Subscription information</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          Data That May Be Retained
        </h2>

        <p className="mb-4">
          Transaction and financial records may be retained for legal,
          taxation, fraud prevention, and regulatory compliance purposes as
          required by law.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          Processing Time
        </h2>

        <p>
          Account deletion requests are processed within 7 business days.
        </p>
      </div>
    </div>
  );
}