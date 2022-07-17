import {useContext} from 'react';
import { UserContext } from "./UserContextProvider";

function UserDashboard() {
    const {
      user, chainId, voting, workflow, currentStatus, propsArray, setPropsArray, display, setDisplay, id, setId, setVotersWhoVoted, votersWhoVoted, winningProp, winningId, setWinningProp
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
  
    async function checkHasVoted() {
      if (voting) {
        
        try {
          
          let listVotersWhoVoted = await voting.queryFilter(voting.filters.Voted());
          for (let i = 0; i < listVotersWhoVoted.length; i++) {
            let voterAddress = listVotersWhoVoted[i].args[0];
            setVotersWhoVoted((Array) => [...Array, ...[ voterAddress ]]);
            
            
           
          }
         
          }
        
           catch (e) {
          console.error(e);
        }
        
      }
    }
  
    async function getWinningProp() {
      if (voting) {
        try {
          let prop = await voting.getOneProposal(winningId);
          let propdesc = prop.description;
          setWinningProp(propdesc);
        } catch (e) {
          console.error(e);
        }
      }
    }
  
    const handleClick = () => {
  
      if (!display) {
      checkHasVoted();
      showProposal();
      setDisplay(true);
      
      } else {
        
        setPropsArray([]);
        setDisplay(false);
        
      }
      
    };
    const handleChange = (event) => {
      setId(event.target.value);
      event.preventDefault();
    };
  
    async function handleSubmit(event) {
      event.preventDefault();
      if (votersWhoVoted.includes(user)) {
        alert(`you've already voted!`);
      } else if(id === "") {
        console.log("nothing selected");
      } else {
        let tx = await voting.setVote(id);
        console.log(tx);
        setDisplay(false);
        voting.on("Voted", (address, proposalId) => {
          alert(`Your vote for proposal ${proposalId} with your address (${address} has been registered, thank you for your vote)`) });
        }
      }
      
    
  
    return (
  
  
  
      <div><hr />
        {!user && (<><p>Metamask isn't connected</p></>)}
        {user && chainId && (<div><p>Adresse connectée : {user}</p><p>Current status is : {currentStatus[workflow]}</p> 
        
          
  
          {user && workflow === 0 && (<>
            <p>Proposals submission haven't started yet</p>   
          </>
          )}
          {user && workflow === 1 && (<>
            <p>Tell us in your own words, what would be best !</p><input type='text' placeholder='Your brilliant idea goes here' id='someoneSaid' /><button onClick={handleProposal}>Submit!</button> 
            
          
            
          </>
          )}
          {user && workflow === 2 && (<>
            <p>Proposals submission is now closed, waiting for admin to start voting session</p>
          </>
          )}
          
          {user && workflow === 3 && (<>
          <h3>Time to Vote !</h3> 
          {!display ? <button onClick={handleClick}>I'm ready to vote</button> : 
          <form onSubmit={handleSubmit}>
          <select value = {id} onChange={handleChange}>
            <option value="">Select a Proposal</option>
           {propsArray.map((prop) => {
             return (
             <option key={prop[0]} value={prop[0][0]}> {prop[0][1]} </option>
             )
           })}
          </select>
          <input type="submit" value="Confirm" />
          </form>
          }
          </>)}
  
          {user && workflow === 4 && (<>
            <p>Voting session has ended, waiting for admin to tally votes</p>
          </>
          )}
  
      {user && workflow === 5 && (<>
            <p>Winning proposal is {winningProp}</p><button onClick={getWinningProp}>get</button>
          </>
          )}    
  
          {user && workflow < 3 && workflow >=1 && (<>{!display ? <button onClick={handleClick}>Show Proposals</button> : <button onClick={handleClick}>Hide Proposals</button>}</>)}
            {display && workflow <=3 ? 
              <><hr /><table>
              <thead>
                  <tr>
                      <th>Submitted proposals</th>
                  </tr>
              </thead>
              <tbody>
              {propsArray.map((prop) => (
                  <tr key={prop[0]}>
                      <td key={prop[1]}>{prop[0][1]}</td>                    
                  </tr>
              ))}
              </tbody>
          </table></> : <></>}
          </div>
          )}
      </div>
  
  
    );
  }

  export default UserDashboard;