import React from 'react'

const BackgroundTest = () => {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Background Effects Test</h1>
      
      {/* Test cards to see glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-md shadow-xl border-2 border-white/60">
          <h3 className="text-xl font-semibold mb-4">Test Card 1</h3>
          <p>This should have a glassmorphism effect with the background visible through it.</p>
        </div>
        
        <div className="p-6 rounded-2xl bg-white/20 backdrop-blur-lg shadow-xl border border-white/30">
          <h3 className="text-xl font-semibold mb-4">Test Card 2</h3>
          <p>This card has lower opacity to show more background.</p>
        </div>
        
        <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm shadow-xl border-2 border-white/80">
          <h3 className="text-xl font-semibold mb-4">Test Card 3</h3>
          <p>This card has higher opacity for comparison.</p>
        </div>
      </div>
      
      {/* Fixed test elements */}
      <div className="fixed top-4 right-4 p-4 bg-red-500/50 text-white rounded">
        Background Test Overlay
      </div>
      
      <div className="fixed bottom-4 left-4 p-4 bg-blue-500/50 text-white rounded">
        Z-Index Test
      </div>
    </div>
  )
}

export default BackgroundTest
