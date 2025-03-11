import { Boundary } from '../components/ui/Boundary';

export default function NotFound() {
    return(
         <Boundary color="red">
         <div className="space-y-4 text-vercel-pink">
        <h2 className="text-lg font-bold">Not Found</h2>

        <p className="text-sm">Could not find requested resource</p>
      </div>
    </Boundary>
  );
}