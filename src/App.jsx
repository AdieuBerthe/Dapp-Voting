import {
  useEffect,
  useState,
  createContext,
  useContext,
} from 'react';
import {
  BigNumber,
  Contract,
  providers,
} from 'ethers';

import abi from './abi.json';
import { getAddress } from 'ethers/lib/utils';

const UserContext = createContext();

function App() {
  const [admin, setAdmin] = useState();;
  const [user, setUser] = useState();
  const [chainId, setChainId] = useState();
  const [voterLog, setVoterLog] = useState([]);
  const [propsArray, setPropsArray] = useState([]);
  const [provider, setProvider] = useState();
  const [voting, setVoting] = useState();
  const [workflow, setWorkflow] = useState();
  const currentStatus =["Registering voters", "Submiting proposals", "Proposals submission ended", "Voting session started", "voting session ended", "Votes have been tallied"];


  useEffect(() => {
    (async function () {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        setUser(getAddress(accounts[0]));

        setProvider(new providers.Web3Provider(window.ethereum));
      }

      window.ethereum.on('accountsChanged', (accounts) => {
        setUser(getAddress(accounts[0]));
      });

      window.ethereum.on('chainChanged', (newChainId) => {
        setChainId(newChainId);
      });
    })();
  }, []);

  useEffect(() => {
    (async function () {
      if (provider) {
        const signer = provider.getSigner();

        setVoting(new Contract(
          '0x239a13012e022668c9731cC57EB0eCD6D653f08D',
          abi,
          signer,
        ));

      }
    })();
  }, [provider]);

  useEffect(() => {
    (async function () {
      if (voting) {
        setAdmin(getAddress(await voting.owner()));
        setWorkflow(0);
        }
    })();
  }, [voting]);

 




  return (
    <UserContext.Provider value={{
      user,
      chainId,
      admin,
      voting,
      voterLog,
      setVoterLog,
      workflow,
      setWorkflow,
      currentStatus,
      propsArray,
      setPropsArray,
    }}>
      <UserDashboard />
      <AdminDashboard />
    </UserContext.Provider>
  );
}

function UserDashboard() {
  const {
    user, chainId, voting, workflow, currentStatus, propsArray, setPropsArray
  } = useContext(UserContext);

  async function handleProposal() {
    if (voting) {
      try {
        await voting.addProposal(document.getElementById('someoneSaid').value);
        voting.on("ProposalRegistered", (proposalId) => {
          setPropsArray((arr) => { return [...arr, { proposalId }] });
          console.log(propsArray[0]);
        })

      } catch (e) {
        console.error(e);
      }
    }
  }

  return (
    <>
      
      <p>Current status is : {currentStatus[workflow]}</p> {user ? `Currently connected address is ${user}` : 'no wallet...'}
      
      {chainId && chainId !== '0x3' && (
        <p>Vous êtes connecté à {chainId}, connectez vous à Ropsten</p>
      )}
      <p>Current status is : {currentStatus[workflow]}</p>
      {user && workflow === 0 && (<>
      <p>Proposals submission haven't started yet</p>
        </>
      )}
      {user && workflow === 1 && (<>
      <p>Tell us in your own words, what would be best !</p><input type='text' placeholder='Your brilliant idea goes here' id='someoneSaid' /><button onClick={handleProposal}>Submit!</button>
        </>
      )}
      {user && workflow >= 2 && (<>
      <p>Proposals submission is now closed</p>
        </>
      )}
    </>
  );
}

function AdminDashboard() {
  const {
    user, admin, voting, voterLog, setVoterLog, workflow, setWorkflow
  } = useContext(UserContext);

  
  async function registerVoter() {

    if (voting) {
      try {
        await voting.addVoter(document.getElementById('voterAddress').value);
        voting.on("VoterRegistered", (voterAddress) => {
          setVoterLog((arr) => { return [...arr, { voterAddress }] });
        })

      } catch (e) {
        console.error(e);
      }
    }

  };

  async function handleWorkflow() {

    if (voting) {
      try {
        let tx;
      switch(workflow) {
      case 0 : tx = await voting.startProposalsRegistering();
      break;
      case 1 : tx = await voting.endProposalsRegistering();
      break;
      case 2 : tx = await voting.startVotingSession();
      break;
      case 3 : tx = await voting.endVotingSession();
      break;
      case 4 : tx = await voting.tallyVotes();
      break;
      default : alert("something went wrong");
    }

    const receipt = await tx.wait();
      console.log(receipt);
      
      await voting.on("WorkflowStatusChange", (previsousStatus, newStatus, event) => {
        const i = BigNumber.from(newStatus).toNumber();
        setWorkflow(i);
        
        
      }) 
      
      } catch (e) {
        console.error(e);
      }
    }

    

  };

  return (
    <div>
      {user && user === admin && (
        
        <div>
          <hr />
          <h2>Admin Panel</h2>{workflow < 5 && (<><button onClick={handleWorkflow}>Next step</button></>)}
          <br />
          <input type='text' placeholder='Type address here' id='voterAddress'></input>
          <button onClick={registerVoter}>
            Add voter
          </button>
          <ul>

            {voterLog.map((addr) => (
              <li key={addr.voterAddress}>
                {addr.voterAddress}
              </li>
            ))}

          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
