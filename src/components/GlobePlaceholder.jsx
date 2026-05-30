export default function Globe() {
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-black relative">
      <div className="flex items-center justify-center w-64 h-64 rounded-full bg-gradient-to-tr from-blue-900 to-indigo-900 shadow-2xl animate-pulse">
        <div className="text-white text-center font-bold text-2xl">PrithviSetu</div>
      </div>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-lg">
        {/* The SearchBar component must be rendered by App.jsx, not here, to avoid circular dependencies if we don't have it imported */}
      </div>
    </div>
  );
}
