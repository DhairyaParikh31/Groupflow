export interface Member {
  id: string;
  name: string;
  leader: string;
  photo?: string;
  attended?: boolean;
  reason?: string;
}

export interface EventLeader {
  leader: string;
  name: string;
  memberCount: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  time: {
    start: string;
    end: string;
  };
  information: string;
  leaders: EventLeader[];
  attendees?: Member[];
  isCompleted?: boolean;
}