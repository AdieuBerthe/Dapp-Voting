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
  const [display, setDisplay] = useState(false);
  const currentStatus = ["Registering voters", "Submiting proposals", "Proposals submission ended", "Voting session started", "voting session ended", "Votes have been tallied"];
  


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

      }
    })();
  }, [voting]);

  useEffect(() => {
    (async function () {
      if (voting) {
        let i = await voting.workflowStatus();

        setWorkflow(BigNumber.from(i).toNumber());
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
      display, setDisplay
      }}>
      <AdminDashboard />
      <UserDashboard />
      </UserContext.Provider>
  );
}

function UserDashboard() {
  const {
    user, chainId, voting, workflow, currentStatus, propsArray, setPropsArray, display, setDisplay
  } = useContext(UserContext);
  

  async function handleProposal() {
    if (voting) {
      try {
        await voting.addProposal(document.getElementById('someoneSaid').value);
      } catch (e) {
        console.error(e);
      }
    }
  }





  async function showProposal() {
    if (voting) {
      try {
        
        let listProposals = await voting.queryFilter(voting.filters.ProposalRegistered());
        for (let i = 0; i < listProposals.length; i++) {
          let prop = await voting.getOneProposal(i);
          let propdesc = prop.description;
          setPropsArray((propsArray) => [...propsArray, [[i, propdesc]]]);
        }




      } catch (e) {
        console.error(e);
      }
    }
  }

  const handleClick = () => {

    if (!display) {
    showProposal();
    setDisplay(true);
    
    } else {
      
      setPropsArray([]);
      setDisplay(false);
      
    }
    
  };

  return (



    <div><hr />{user && (<div></div>)}
      {!user && (<><p>Metamask isn't connected</p></>)}
      {user && (<div><p>Current status is : {currentStatus[workflow]}</p>

        {chainId && chainId !== '0x3' && (
          <p>Vous êtes connecté à {chainId}, connectez vous à Ropsten</p>
        )}

        {user && workflow === 0 && (<>
          <p>Proposals submission haven't started yet</p>   
        </>
        )}
        {user && workflow === 1 && (<>
          <p>Tell us in your own words, what would be best !</p><input type='text' placeholder='Your brilliant idea goes here' id='someoneSaid' /><button onClick={handleProposal}>Submit!</button> 
          {user && workflow >=1 && workflow <= 5 && (<>{!display ? <button onClick={handleClick}>Show Proposals</button> : <button onClick={handleClick}>Hide Proposals</button>}</>)}
          {display ? 
            <><hr /><table>
            <thead>
                <tr>
                    <th>Submitted proposals</th>
                </tr>
            </thead>
            <tbody>
            {propsArray.map((prop) => (
                <tr key={prop[0]}>
                    <td key={prop[1]}>{prop[0]}</td>
                    
                </tr>
            ))}
            </tbody>
        </table></> : <></>}
          
        </>
        )}
        {user && workflow === 2 && (<>
          <p>Proposals submission is now closed, waiting for admin to start voting session</p>
        </>
        )}</div>)}
    </div>


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
        switch (workflow) {
          case 0: tx = await voting.startProposalsRegistering();
            break;
          case 1: tx = await voting.endProposalsRegistering();
            break;
          case 2: tx = await voting.startVotingSession();
            break;
          case 3: tx = await voting.endVotingSession();
            break;
          case 4: tx = await voting.tallyVotes();
            break;
          default: alert("something went wrong");
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
          
          <h2>Admin Panel</h2>{workflow < 5 && (<><button onClick={handleWorkflow}>Next step</button></>)}
          <br />
          {workflow === 0 && (<><input type='text' placeholder='Type address here' id='voterAddress'></input>
          <button onClick={registerVoter}>
            Add voter
          </button>
          <ul>

            {voterLog.map((addr) => (
              <li key={addr.voterAddress}>
                {addr.voterAddress}
              </li>
            ))}

          </ul></>)}
        </div>
      )}
    </div>
  );
}

export default App;
