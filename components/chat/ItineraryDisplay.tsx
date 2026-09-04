'use client';

import { ItineraryDay, TripDetails } from '@/types/chat';

interface ItineraryDisplayProps {
  tripTitle: string | null;
  tripDetails: TripDetails;
  itinerary: ItineraryDay[];
}

export default function ItineraryDisplay({
  tripTitle,
  tripDetails,
  itinerary,
}: ItineraryDisplayProps) {
  // Build a compact meta string from trip details
  const metaParts: string[] = [];
  if (tripDetails.destination) metaParts.push(tripDetails.destination);
  if (tripDetails.durationDays)
    metaParts.push(
      `${tripDetails.durationDays} ${tripDetails.durationDays === 1 ? 'day' : 'days'}`
    );
  if (tripDetails.travelers)
    metaParts.push(
      `${tripDetails.travelers} ${tripDetails.travelers === 1 ? 'traveler' : 'travelers'}`
    );
  if (tripDetails.budget) metaParts.push(tripDetails.budget);
  if (tripDetails.travelDates) metaParts.push(tripDetails.travelDates);

  return (
    <div className="itin">
      {/* Trip header */}
      {tripTitle && (
        <h3 className="itin-title">{tripTitle}</h3>
      )}
      {metaParts.length > 0 && (
        <p className="itin-meta">{metaParts.join(' · ')}</p>
      )}

      {/* Day-by-day timeline */}
      <ol className="itin-days">
        {itinerary.map((day) => (
          <li key={day.day} className="itin-day">
            {/* Timeline spine + day label */}
            <div className="itin-day-label" aria-label={`Day ${day.day}`}>
              <span className="itin-day-num">
                {String(day.day).padStart(2, '0')}
              </span>
              <span className="itin-day-spine" aria-hidden="true" />
            </div>

            {/* Day content */}
            <div className="itin-day-content">
              <p className="itin-day-title">{day.title}</p>
              {day.highlight && (
                <p className="itin-day-highlight">{day.highlight}</p>
              )}
              {day.activities.length > 0 && (
                <ul className="itin-activities">
                  {day.activities.map((activity, idx) => (
                    <li key={idx} className="itin-activity">
                      <span className="itin-activity-dot" aria-hidden="true" />
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
