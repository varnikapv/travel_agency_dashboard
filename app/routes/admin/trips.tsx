import React, { useState } from 'react'
import Header from '~/components/Header'
import { useSearchParams, type LoaderFunctionArgs } from "react-router";
import type {Route} from "./+types/trips";
import { getTripById, getAllTrips } from '~/appwrite/trips';
import { parseTripData } from '~/lib/utils';
import TripCard from '~/components/TripCard';
import { PagerComponent } from '@syncfusion/ej2-react-grids';


export const loader = async ({ request }:  LoaderFunctionArgs) => {
  const limit = 8;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', )
    const offset = (page - 1) * limit;


    const {allTrips, total} = await getAllTrips(limit, offset);


     return {

        trips: allTrips.map(({$id, tripDetail, imageUrls})=> ({
            id: $id,
            ...parseTripData(tripDetail),
            imageUrls: imageUrls ?? []
        })),
        total
    }
}

const Trips = ({loaderData}: Route.ComponentProps) => {
  const trips = loaderData.trips as Trip[]  | [];

  const [searchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page' )|| '1')
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const handlePageChange = (page:number) => {
    setCurrentPage(page);
    window.location.search = '?page=${page}'
  }

  return (
    <main className='all-users wrapper'>
      <Header    
          title="Trips"
          description="View and Edit AI-generated travel plans" 
          ctaText="Create a trip"
          ctaUrl="/trips/create"       
        />

        <section>
          <h1 className='p-24-semibold text-dark-100'>Manage Created Trips</h1>
          <div className='trip-grid mb-4'>
          {trips.map((trip)=>(
                            <TripCard id={trip.id} 
                            key = {trip.id}
                            name={trip.name}
                            location={trip.itinerary?.[0]?.location ?? ''}
                            imageUrl={trip.imageUrls?.[0] ?? ''}
                            tags={[trip.interests, trip.travelStyle]}
                            price = {trip.estimatedPrice}
                        />
                        ))}
          </div>
          <PagerComponent 
          totalRecordsCount={loaderData.total}
          pageSize={8}
          currentPage={currentPage}
          click = {(args) => handlePageChange(args.currentPage)}
          cssClass='!mb-4'
          />
        </section>
    </main>
  )
}

export default Trips