import { BigNumber } from 'ethers'
import {useContext} from 'react';
import { UserContext } from "./UserContextProvider";
import './styles/AdminDashboard.css';

function AdminDashboard() {
    const {
      user, admin, voting, workflow, setWorkflow, setWinning, listVoters, setVotersList, displayVoters, setDisplayVoters
    } = useContext(UserContext);
  const wfsDisplay = ["Start proposals subimission", "End proposals submission", "Start voting Session", "End voting session", "Tally votes"];
  
    async function registerVoter() {
  
      if (voting) {
        try {
          let tx = await voting.addVoter(document.getElementById('voterAddress').value);
          if(tx.wait()) {alert("success")};
  
        } catch (e) {
          console.error(e);
        }
      }
  
    };
  
    async function showVoters() {
      if (voting) {
        try {
          let Voters = await voting.queryFilter(voting.filters.VoterRegistered());
          for (let i = 0; i < Voters.length; i++) {
            let voter = Voters[i].args[0];
            setVotersList((Array) => [...Array, [ voter ] ]);
          }
          } catch (e) {
          console.error(e);
        }
      }
    }
  
   
    const toggleVoterDisplay = () => {
  
      if (!displayVoters) {
      showVoters();
      setDisplayVoters(true);
      
      } else {
        
        setVotersList([]);
        setDisplayVoters(false);
        
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
          if (workflow === 5) {
            let winningId = await voting.winningProposalID();
            setWinning(BigNumber.from(winningId).toNumber());
          }
  
        } catch (e) {
          console.error(e);
        }
      }
  
  
  
    };
  
    return (
      <div >
        
        {user && user === admin && (
  
          <div className='global-admin'>
            
            <h2 className='whitetext'>Admin Panel</h2>{workflow < 5 && (<div className='toright'><button className='button' onClick={handleWorkflow}>{wfsDisplay[workflow]}</button></div>)}
            <br />
            {workflow === 0 && (<><input className='input' type='text' placeholder='Type address here' id='voterAddress'></input>
            <button className='button-submit' onClick={registerVoter}>Add voter</button>
            </>)}
            {user && workflow <= 3 && (<div className='globaladmin'><br/>{!displayVoters ? <button className='button' onClick={toggleVoterDisplay}>Show registered voters</button> : <button className='button' onClick={toggleVoterDisplay}>Hide registered voters</button>}</div>)}
            {displayVoters && workflow <=3 ? 
              <div className='voters'><table className='whitetext'>
              <thead>
                  <tr>
                      <th>Registered Voters</th>
                  </tr>
              </thead>
              <tbody>
              {listVoters.map((voter) => (
                  <tr key={voter[0]}>
                      <td key={voter[1]}>{voter[0]}</td>                    
                  </tr>
              ))}
              </tbody>
          </table></div> : <div className='global-admin'></div>}
          </div>
        )}
        
      </div>
    );
  }

  export default AdminDashboard;