import React from 'react'

export default function ProgressCard() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md sm:p-8">
            <h2 className="mb-6 text-center text-lg font-bold text-[#1a2b4d] sm:mb-8 sm:text-xl">
              Today’s Progress
            </h2>

            <div className="mb-6 flex justify-center sm:mb-8">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-8 border-gray-200 sm:h-40 sm:w-40">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 sm:text-3xl">0%</p>
                  <p className="text-xs text-[#7d8fb3] sm:text-sm">Complete</p>
                </div>
              </div>
            </div>

            <div className="flex justify-around text-center text-sm sm:text-base">
              <div>
                <p className="font-bold">0</p>
                <p className="text-[#7d8fb3]">Completed</p>
              </div>
              <div>
                <p className="font-bold">1</p>
                <p className="text-[#7d8fb3]">Remaining</p>
              </div>
              <div>
                <p className="font-bold">1</p>
                <p className="text-[#7d8fb3]">Total</p>
              </div>
            </div>
          </div>
  )
}
