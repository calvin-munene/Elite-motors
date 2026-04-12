import { Testimonial } from "@workspace/api-client-react";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="bg-card border border-border p-8 rounded-lg relative overflow-hidden group hover:border-primary/50 transition-colors">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.017 21L16.411 14.188C17.305 11.238 18.064 8.791 18.69 6.848C19.316 4.905 19.63 3.627 19.63 3.013H15.034C14.735 3.868 14.348 4.962 13.871 6.294C13.394 7.626 12.827 9.138 12.17 10.828L14.017 21ZM5.01697 21L7.41097 14.188C8.30497 11.238 9.06397 8.791 9.68997 6.848C10.316 4.905 10.63 3.627 10.63 3.013H6.03397C5.73497 3.868 5.34797 4.962 4.87097 6.294C4.39397 7.626 3.82697 9.138 3.16997 10.828L5.01697 21Z" />
        </svg>
      </div>

      <div className="flex mb-6">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < testimonial.rating ? "text-accent fill-accent" : "text-gray-600"}`}
          />
        ))}
      </div>

      <p className="text-gray-300 mb-8 italic relative z-10 line-clamp-4">
        "{testimonial.review}"
      </p>

      <div className="flex items-center gap-4">
        {testimonial.photo ? (
          <img
            src={testimonial.photo}
            alt={testimonial.name}
            className="w-12 h-12 rounded-full object-cover border border-white/10"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center border border-white/10 text-white font-serif text-xl">
            {testimonial.name.charAt(0)}
          </div>
        )}
        <div>
          <h4 className="font-bold text-white text-sm">{testimonial.name}</h4>
          <div className="text-xs text-gray-500">
            {testimonial.location && <span>{testimonial.location}</span>}
            {testimonial.location && testimonial.carPurchased && <span> • </span>}
            {testimonial.carPurchased && <span className="text-primary">{testimonial.carPurchased}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
