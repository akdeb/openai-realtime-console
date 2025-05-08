import Image from 'next/image';

const FeaturedOn = () => {
  const features = [
	{
		name: 'OpenAI',
		logo: '/logos/oai.png',
		link: 'https://cookbook.openai.com/examples/voice_solutions/running_realtime_api_speech_on_esp32_arduino_edge_runtime_elatoai'
	  },
    {
      name: 'Hacker News',
      logo: '/logos/hn.webp',
      link: 'https://news.ycombinator.com/item?id=43762409'
    },
    {
      name: 'Adafruit Industries',
      logo: '/logos/adafruit.webp',
      link: 'https://blog.adafruit.com/2025/05/06/elatoai-realtime-speech-ai-agents-for-esp32/'
    }
  ];

  return (
    <section className="pt-6">
      <div className="max-w-2xl mx-auto px-4 sm:px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">
            Featured On
          </h2>
          <p className="text-sm text-gray-600">
            Trusted by leading technology companies and communities
          </p>
        </div>
        <div className="grid grid-cols-3">
		{features.map((feature) => (
			<a href={feature.link} target="_blank" rel="noopener noreferrer" key={feature.name}>
            <div
              className="flex flex-col items-center"
            >
              <div className="relative w-24 h-24">
                <Image
                  src={feature.logo}
                  alt={feature.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
			</a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedOn;