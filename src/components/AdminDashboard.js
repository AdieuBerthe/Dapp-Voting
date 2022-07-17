import { BigNumber } from 'ethers'
import {useContext} from 'react';
import { UserContext } from "./UserContextProvider";

function AdminDashboard() {
    const {
      user, admin, voting, workflow, setWorkflow, setWinning, listVoters, setVotersList, displayVoters, setDisplayVoters
    } = useContext(UserContext);
  
  
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
      <div>
        {user && user === admin && (
  
          <div>
            
            <h2>Admin Panel</h2>{workflow < 5 && (<><button className='button-81' onClick={handleWorkflow}>Next step</button></>)}
            <br />
            {workflow === 0 && (<><input type='text' placeholder='Type address here' id='voterAddress'></input>
            <button onClick={registerVoter}>
              Add voter
            </button>
  
            </>)}
            {user && workflow <= 3 && (<>{!displayVoters ? <button onClick={toggleVoterDisplay}>Show registered voters</button> : <button onClick={toggleVoterDisplay}>Hide registered voters</button>}</>)}
            
            {displayVoters && workflow <=3 ? 
              <><hr /><table>
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
          </table></> : <></>}
          </div>
        )}
      </div>
    );
  }

  export default AdminDashboard;