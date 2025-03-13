// src/pages/privacy.js
import React from 'react';
import Head from 'next/head';

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Tempu Task</title>
      </Head>
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Last updated: March 1, 2025</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Tempu Task collects the following information to provide you with our time tracking and productivity services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Account information (email address)</li>
                <li>Time tracking data (start and end times, project details, task categories)</li>
                <li>Usage statistics to improve our service</li>
              </ul>
            </section>
            
            <div className="border-t border-gray-200 dark:border-slate-700"></div>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">We use your data to:</p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Provide our time tracking and productivity analysis services</li>
                <li>Generate insights about your work patterns</li>
                <li>Improve our product features and user experience</li>
                <li>Ensure the security of your account</li>
              </ul>
            </section>
            
            <div className="border-t border-gray-200 dark:border-slate-700"></div>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. Data Security</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We take the security of your data seriously. All data is encrypted in transit and at rest.
                We implement industry-standard security measures to protect your information from unauthorized
                access, disclosure, alteration, and destruction.
              </p>
            </section>
            
            <div className="border-t border-gray-200 dark:border-slate-700"></div>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">4. Your Data Rights</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Access your personal data</li>
                <li>Export your data</li>
                <li>Delete your data</li>
                <li>Withdraw consent for data processing</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-3">
                You can exercise these rights through your account settings or by contacting us.
              </p>
            </section>
            
            <div className="border-t border-gray-200 dark:border-slate-700"></div>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">5. Data Retention</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We retain your data for as long as your account is active. If you delete your account,
                we will delete all your personal data within 30 days.
              </p>
            </section>
            
            <div className="border-t border-gray-200 dark:border-slate-700"></div>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">6. Changes to This Policy</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We may update our Privacy Policy from time to time. We will notify you of any changes
                by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>
            
            <div className="border-t border-gray-200 dark:border-slate-700"></div>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">7. Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300">
                If you have any questions about this Privacy Policy, please contact us at:
                <a href="mailto:privacy@tempos.ai" className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1">
                  privacy@tempos.ai
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}