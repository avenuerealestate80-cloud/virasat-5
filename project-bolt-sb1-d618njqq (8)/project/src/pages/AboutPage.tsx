import { Award, Users, Shield, Clock, TrendingUp, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-900 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">Who We Are</span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 mb-4">
            About Virasat Realty
          </h1>
          <p className="text-slate-300 max-w-2xl">
            Building legacies. We are more than a real estate company — we are your partners in creating a future you can be proud of.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">Our Story</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-6">
                A Legacy of Trust & Excellence
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Virasat Realty was founded with a simple vision: to make quality real estate accessible to every family in Sohna and its surrounding regions. What started as a small venture has grown into one of the most trusted names in Haryana real estate.
                </p>
                <p>
                  Our portfolio spans residential apartments, commercial complexes, villa plots, and luxury independent homes. We work with renowned builders like Signature Global, Central Park, Breez, Trehan, Shahpuria, Pitarachaya, and Godrej.
                </p>
                <p>
                  Every property we recommend is backed by our commitment to transparency, quality construction, and timely delivery. We believe that a home is not just a structure — it is the foundation of dreams, memories, and generations.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
              <img
                src="https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1"
                alt="Virasat Realty"
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">What Drives Us</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
              Our Core Values
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              These principles guide every decision we make and every relationship we build.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Integrity',
                desc: 'We believe in complete transparency. No hidden costs, no false promises — just honest dealings that build lasting trust.',
              },
              {
                icon: Award,
                title: 'Quality',
                desc: 'From foundation to finish, we use premium materials and follow strict quality standards that exceed expectations.',
              },
              {
                icon: Clock,
                title: 'Timeliness',
                desc: 'We respect your time. Our projects are delivered on schedule, ensuring you move into your dream home as planned.',
              },
              {
                icon: Users,
                title: 'Customer First',
                desc: 'Every decision is made with our customers in mind. Your satisfaction is the true measure of our success.',
              },
              {
                icon: TrendingUp,
                title: 'Innovation',
                desc: 'We embrace modern construction techniques and smart home features to deliver homes ready for the future.',
              },
              {
                icon: Heart,
                title: 'Community',
                desc: 'We do not just build homes — we build communities where neighbors become family and memories are made.',
              },
            ].map((value) => (
              <div
                key={value.title}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center mb-6">
                  <value.icon size={24} className="text-gold-600" />
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Leadership */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">Leadership</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
              Meet the Minds Behind Virasat Realty
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Experienced professionals dedicated to turning your real estate dreams into reality.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-3xl mx-auto">
            {[
              {
                name: 'Hrithik Jakhad',
                role: 'Founder & CEO',
                image: 'https://images.pexels.com/photos/4962539/pexels-photo-4962539.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop&dpr=1',
              },
              {
                name: 'Deepak Singh',
                role: 'Head of Marketing & Tech',
                image: 'https://images.pexels.com/photos/7984730/pexels-photo-7984730.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop&dpr=1',
              },
            ].map((person) => (
              <div key={person.name} className="text-center group">
                <div className="w-36 h-36 mx-auto mb-5 rounded-full overflow-hidden border-4 border-gold-200 group-hover:border-gold-400 transition-colors">
                  <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-900">{person.name}</h3>
                <p className="text-gold-600 text-sm font-medium">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
