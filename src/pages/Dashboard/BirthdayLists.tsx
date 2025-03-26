import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import Modal from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';

interface Person {
  id: string;
  name: string;
  photo?: string;
  email?: string;
  dateOfBirth?: string;
  anniversary?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  phoneNumber?: string;
  type: 'member' | 'leader';
  leader?: string;
}

interface PersonCardProps {
  person: Person;
  isAnniversary?: boolean;
  onClose: () => void;
}

function PersonCard({ person, isAnniversary, onClose }: PersonCardProps) {
  const handleEmailClick = () => {
    const subject = isAnniversary 
      ? `Happy Anniversary ${person.name}!`
      : `Happy Birthday ${person.name}!`;
    
    const body = isAnniversary
      ? `Dear ${person.name},\n\nWishing you a very happy wedding anniversary! May your love continue to grow stronger with each passing year.\n\nBest wishes,\n[Your name]`
      : `Dear ${person.name},\n\nWishing you a very happy birthday! May this special day bring you joy, happiness, and all that your heart desires.\n\nBest wishes,\n[Your name]`;

    window.location.href = `mailto:${person.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
        {person.photo ? (
          <img src={person.photo} alt={person.name} className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover mb-4 md:mb-0" />
        ) : (
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-lg flex items-center justify-center mb-4 md:mb-0">
            <span className="text-2xl text-gray-500">{person.name.charAt(0)}</span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-semibold mb-4">{person.name}</h3>
          <div className="space-y-2">
            {isAnniversary ? (
              <p>Anniversary: {new Date(person.anniversary!).toLocaleDateString()}</p>
            ) : (
              <p>Date of Birth: {new Date(person.dateOfBirth!).toLocaleDateString()}</p>
            )}
            {person.address && (
              <p className="text-sm md:text-base">
                Address: {`${person.address.street}, ${person.address.city}, ${person.address.state} - ${person.address.pincode}`}
              </p>
            )}
            {person.phoneNumber && <p className="text-sm md:text-base">Phone: {person.phoneNumber}</p>}
            {person.email && (
              <button
                onClick={handleEmailClick}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm md:text-base"
              >
                <Mail className="w-4 h-4" />
                <span>{person.email}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BirthdayList({ title, people, isAnniversary = false }: { 
  title: string; 
  people: Person[];
  isAnniversary?: boolean;
}) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  return (
    <div className="bg-white rounded-lg p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-2">
        {people.length > 0 ? (
          people.map((person) => (
            <div 
              key={person.id} 
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              onClick={() => setSelectedPerson(person)}
            >
              {person.photo ? (
                <img src={person.photo} alt={person.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm">{person.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
              )}
              <span className="text-sm hover:underline line-clamp-1">{person.name}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">
            No {isAnniversary ? 'anniversaries' : 'birthdays'} today
          </p>
        )}
      </div>

      <Modal
        isOpen={selectedPerson !== null}
        onClose={() => setSelectedPerson(null)}
        title={`${selectedPerson?.type === 'leader' ? 'Leader' : 'Member'}'s Details`}
      >
        {selectedPerson && (
          <PersonCard
            person={selectedPerson}
            isAnniversary={isAnniversary}
            onClose={() => setSelectedPerson(null)}
          />
        )}
      </Modal>
    </div>
  );
}

export default function BirthdayLists() {
  const { user } = useAuth();
  const [todaysBirthdays, setTodaysBirthdays] = useState<Person[]>([]);
  const [tomorrowsBirthdays, setTomorrowsBirthdays] = useState<Person[]>([]);
  const [todaysAnniversaries, setTodaysAnniversaries] = useState<Person[]>([]);

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth();
  };

  const isTomorrow = (dateString: string) => {
    const date = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.getDate() === tomorrow.getDate() && 
           date.getMonth() === tomorrow.getMonth();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const membersResponse = await fetch('/api/members', {
          credentials: 'include'
        });
        const membersData = await membersResponse.json();
        
        const leadersResponse = await fetch('/api/leaders', {
          credentials: 'include'
        });
        const leadersData = await leadersResponse.json();

        const membersList = membersData.map((member: any) => ({
          id: member.id,
          name: member.name,
          photo: member.photo,
          email: member.email,
          dateOfBirth: member.dateOfBirth,
          anniversary: member.anniversary,
          address: member.address,
          phoneNumber: member.phoneNumber,
          type: 'member',
          leader: member.leader
        }));

        const leadersList = leadersData.map((leader: any) => ({
          id: leader.id,
          name: leader.name,
          photo: leader.photo,
          email: leader.email,
          dateOfBirth: leader.dateOfBirth,
          anniversary: leader.anniversary,
          address: leader.address,
          phoneNumber: leader.phoneNumber,
          type: 'leader'
        }));

        let allPeople = [];
        if (user?.role === 'admin') {
          allPeople = [...membersList, ...leadersList];
        } else if (user?.role === 'leader') {
          const leaderMembers = membersList.filter(member => member.leader === user.id);
          const currentLeader = leadersList.find(leader => leader.id === user.id);
          allPeople = currentLeader ? [...leaderMembers, currentLeader] : leaderMembers;
        }
        
        setTodaysBirthdays(allPeople.filter(person => person.dateOfBirth && isToday(person.dateOfBirth)));
        setTomorrowsBirthdays(allPeople.filter(person => person.dateOfBirth && isTomorrow(person.dateOfBirth)));
        setTodaysAnniversaries(allPeople.filter(person => 
          person.anniversary && isToday(person.anniversary)
        ));

      } catch (error) {
        console.error('Failed to fetch birthday/anniversary data:', error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <BirthdayList title="Today's Birthday List" people={todaysBirthdays} />
      <BirthdayList title="Tomorrow's Birthday List" people={tomorrowsBirthdays} />
      <BirthdayList 
        title="Today's Anniversary List" 
        people={todaysAnniversaries}
        isAnniversary 
      />
    </div>
  );
}