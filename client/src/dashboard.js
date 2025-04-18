import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams,} from 'react-router-dom';
import { LogOut, FileText, ArrowLeft, Filter} from 'lucide-react';

const OfficialDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [user, setUser] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [sortBySeverity, setSortBySeverity] = useState(false);
  const [sortByDate, setSortByDate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
    fetchComplaints();
  }, [navigate, isAnonymous]);

  useEffect(() => {
    filterAndSortComplaints();
  }, [complaints, sortBySeverity, sortByDate, statusFilter]);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(`http://localhost:5000/get-all-${isAnonymous ? 'complaints' : 'non-anonymous-complaints'}`);
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      } else {
        console.error(`Failed to fetch ${isAnonymous ? 'anonymous' : 'non-anonymous'} complaints`);
      }
    } catch (error) {
      console.error(`Error fetching ${isAnonymous ? 'anonymous' : 'non-anonymous'} complaints:`, error);
    }
  };

  const filterAndSortComplaints = async () => {
    let filtered = [...complaints];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }

    // Sort by date
    if (sortByDate) {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Sort by severity using Cohere API
    if (sortBySeverity) {
      const descriptions = filtered.map(complaint => complaint.description);
      try {
        const response = await fetch('http://localhost:5000/analyze-severity', { descriptions });
        const severities = response.data.severities;
        filtered.sort((a, b) => severities[b.id] - severities[a.id]);
      } catch (error) {
        console.error('Error analyzing severity:', error);
      }
    }

    setFilteredComplaints(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAnonymousToggle = () => {
    setIsAnonymous((prevState) => !prevState);
  };

  const handleSeveritySort = () => {
    setSortBySeverity(!sortBySeverity);
    setSortByDate(false);
  };

  const handleDateSort = () => {
    setSortByDate(!sortByDate);
    setSortBySeverity(false);
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
  }

  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '20px',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const titleStyle = {
    fontSize: '2rem',
    color: '#2c3e50',
  };

  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
  };

  const userNameStyle = {
    marginRight: '15px',
    fontSize: '1.1rem',
    color: '#34495e',
  };

  const logoutButtonStyle = {
    padding: '8px 15px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  };

  const anonymousToggleStyle = {
    padding: '8px 15px',
    backgroundColor: isAnonymous ? '#3498db' : '#34495e',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginLeft: '10px',
  };

  const complaintsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  };

  const complaintCardStyle = (status) => ({
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    borderColor:
      status === 'flagged' ? 'red' :
      status === 'investigation' ? 'yellow' :
      status === 'court' ? 'green' : 'transparent',
    borderWidth: '3px',
    borderStyle: 'solid',
  });

  const filterContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const filterButtonStyle = {
    padding: '8px 15px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '10px',
  };

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Official Dashboard</h1>
        <div style={userInfoStyle}>
          <span style={userNameStyle}>{user?.name}</span>
          <button onClick={handleLogout} style={logoutButtonStyle}>
            <LogOut size={18} style={{ marginRight: '5px' }} />
            Logout
          </button>
          <button onClick={handleAnonymousToggle} style={anonymousToggleStyle}>
            {isAnonymous ? 'Anonymous' : 'Non-Anonymous'}
          </button>
        </div>
      </header>

      <div style={filterContainerStyle}>
        <div>
          <button onClick={handleSeveritySort} style={filterButtonStyle}>
            <Filter size={18} style={{ marginRight: '5px' }} />
            Sort by Severity
          </button>
          <button onClick={handleDateSort} style={filterButtonStyle}>
            <Filter size={18} style={{ marginRight: '5px' }} />
            Sort by Date
          </button>
        </div>
        <select onChange={handleStatusFilter} style={filterButtonStyle}>
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="investigation">Investigation</option>
          <option value="court">Court</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      <div style={complaintsContainerStyle}>
        {filteredComplaints.map((complaint) => (
          <Link to={`/complaint-detail/${complaint.id}`} key={complaint.id}>
            <div style={complaintCardStyle(complaint.status)}>
              <FileText size={24} style={{ marginBottom: '10px', color: '#3498db' }} />
              <h3>{complaint.id}</h3>
              <p>Date: {complaint.date}</p>
              <p>Place: {complaint.place}</p>
              <p>Status: {complaint.status}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};


const ComplaintDetail = () => {
  const { complaintId } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaintDetail();
  }, [complaintId]);

  const fetchComplaintDetail = async () => {
    try {
      const response = await fetch(`http://localhost:5000/get-${isAnonymous ? 'complaint' : 'non-anonymous-complaint'}/${complaintId}`);
      if (response.ok) {
        const data = await response.json();
        setComplaint(data);
        setIsAnonymous(!data.hasOwnProperty('name')); // Set isAnonymous based on the presence of 'name' field
      } else {
        console.error(`Failed to fetch ${isAnonymous ? 'anonymous' : 'non-anonymous'} complaint`);
      }
    } catch (error) {
      console.error(`Error fetching ${isAnonymous ? 'anonymous' : 'non-anonymous'} complaint:`, error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      const response = await fetch(`http://localhost:5000/update-${isAnonymous ? 'complaint' : 'non-anonymous-complaint'}-status/${complaintId}`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setComplaint((prevComplaint) => ({ ...prevComplaint, status: newStatus }));
      } else {
        console.error('Failed to update complaint status');
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const detailContainerStyle = {
    padding: '20px',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    maxWidth: '600px',
    margin: 'auto',
    marginTop: '20px',
  };

  const imageStyle = {
    width: '100%',
    height: 'auto',
    borderRadius: '10px',
    marginTop: '10px',
  };

  const buttonStyle = {
    padding: '8px 15px',
    margin: '5px',
    borderRadius: '5px',
    cursor: 'pointer',
    border: 'none',
    color: 'white',
  };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={handleBackClick} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <ArrowLeft size={18} style={{ marginRight: '5px' }} />
        Back
      </button>
      {complaint ? (
        <div style={detailContainerStyle}>
          <h2>Complaint Details</h2>
          <p><strong>ID:</strong> {complaint.id}</p>
          <p><strong>Date:</strong> {complaint.date}</p>
          <p><strong>Place:</strong> {complaint.place}</p>
          <p><strong>Description:</strong> {complaint.description}</p>
          <p><strong>Status:</strong> {complaint.status}</p>
          <h3>Evidence Files:</h3>
          {complaint.evidence_files.map((file, index) => (
            <div key={index}>
              <p>{file.filename}</p>
              <img src={`data:image/png;base64,${file.content}`} alt={file.filename} style={imageStyle} />
            </div>
          ))}
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => handleStatusChange('flagged')}
              style={{ ...buttonStyle, backgroundColor: '#e74c3c' }}
            >
              Flag Complaint
            </button>
            <button
              onClick={() => handleStatusChange('investigation')}
              style={{ ...buttonStyle, backgroundColor: '#f39c12' }}
            >
              Move to Investigation
            </button>
          </div>
          {complaint.status === 'investigation' && (
            <div style={{ marginTop: '20px' }}>
              <h3>Investigation Options:</h3>
              <button style={{ ...buttonStyle, backgroundColor: '#3498db' }} onClick={() => navigate(`/chat/${complaint.id}`)}>Chat</button>
              <button style={{ ...buttonStyle, backgroundColor: '#2ecc71' }}>Call</button>
              <button
                onClick={() => handleStatusChange('court')}
                style={{ ...buttonStyle, backgroundColor: '#9b59b6' }}
              >
                Move to Court
              </button>
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export { OfficialDashboard, ComplaintDetail };