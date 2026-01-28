export default function PomodoroSettings({
  onClose,
  focusTime,
  setFocusTime,
  shortBreak,
  setShortBreak,
  longBreak,
  setLongBreak,
  interval,
  setInterval
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[480px] rounded-xl p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-gray-800">Pomodoro Setting</h2>
        <p className="text-sm text-gray-500 mb-6">Customize your focus and break durations</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Focus Time</label>
            <select
              value={focusTime}
              onChange={(e) => setFocusTime(Number(e.target.value))}
              className="w-full mt-1 p-3 bg-gray-100 rounded-lg outline-none"
            >
              <option value={25}>25 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Long Break</label>
            <select
              value={longBreak}
              onChange={(e) => setLongBreak(Number(e.target.value))}
              className="w-full mt-1 p-3 bg-gray-100 rounded-lg"
            >
              <option value={15}>15 Minutes</option>
              <option value={20}>20 Minutes</option>
              <option value={30}>30 Minutes</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Short Break</label>
            <select
              value={shortBreak}
              onChange={(e) => setShortBreak(Number(e.target.value))}
              className="w-full mt-1 p-3 bg-gray-100 rounded-lg"
            >
              <option value={5}>5 Minutes</option>
              <option value={10}>10 Minutes</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Long Break Interval</label>
            <select
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="w-full mt-1 p-3 bg-gray-100 rounded-lg"
            >
              <option value={2}>2 Sessions</option>
              <option value={4}>4 Sessions</option>
              <option value={6}>6 Sessions</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white hover:scale-105 transition"
          >
            Cancel
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
