import { useContext, useState, useEffect } from 'react';
import { UserContext } from "./UserContextProvider";
import './styles/UserDashboard.css';

function UserDashboard() {
  const {
    user, voting, workflow, currentStatus, propsArray, setPropsArray, display, setDisplay, id, setId, setVotersWhoVoted, votersWhoVoted, winningProp, winningId, setWinningProp, displayWinner, setDisplayWinner, votedFor, setVotedFor, 
  } = useContext(UserContext);  

   const [disabled, setDisabled] = useState(false);

  
   useEffect(() => {
    (async function () {
      if (voting) {
        let listVotersWhoVoted = await voting.queryFilter(voting.filters.Voted());
        for (let i = 0; i < listVotersWhoVoted.length; i++) {
          let voterAddress = listVotersWhoVoted[i].args[0];
          setVotersWhoVoted((Array) => [...Array, ...[voterAddress]]);
        }
        if(votersWhoVoted.includes(user)) {
          setDisabled(true);
        }
      }
    })();
    // eslint-disable-next-line
  }, [voting, workflow]);


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



  async function getVote() {
    let address = document.getElementById('someAddress').value;
    if (address.length === 42) {
      try {
        let Voter = await voting.getVoter(address);
          if (Voter[1]) {
            let prop = await voting.getOneProposal(Voter[2]);
            setVotedFor(prop[0]);
        } else {
          alert("This one didn't vote or wasn't registered at all ! :(");
        }
      }
      catch (e) {
        console.error(e);
      }
    } else { 
      alert("This doesn't match an address length");
    };
  }

  async function getWinningProp() {
    if (voting) {
      try {
        if(!displayWinner) {
        setWinningProp('');
        let prop = await voting.getOneProposal(winningId);
        
        let propdesc = prop.description;
        setWinningProp(propdesc);
        showWinner();
        } 
      } catch (e) {
        console.error(e);
      }
    }
  }

  const showWinner = () => {
    setDisplayWinner(true);
  }

  const handleClick = () => {
      setPropsArray([]);
    if (!display) {
      showProposal();
      setDisplay(true);
    } else {
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
    } else if (id === "") {
      console.log("nothing selected");
    } else {
      let tx = await voting.setVote(id);
      console.log(tx);
      setDisplay(false);
      voting.on("Voted", (address) => {
        setDisabled(true);
        });
    }
  }



  return (


<>
    <div className='global-user'>
    {!user && (<><p>Metamask isn't connected</p></>)}
    <div className='element'><p>Connected account :<br /> {user}</p><p>Current status : {currentStatus[workflow]}</p></div>
      <h1>Voting Dapp</h1>
     
      
      
          
      <>

      


        {user && workflow === 0 && (<>
          <p>Proposals submission haven't started yet</p>
        </>
        )}
        
        {user && workflow === 1 && (
        <div className='up'>
          <h3>Tell us in your own words, what would be best !</h3><input className='input' type='text' placeholder='Your brilliant idea goes here' id='someoneSaid' /><button className='button-submit' onClick={handleProposal}>Submit!</button>
        </div>)}
        

        {user && workflow === 2 && (<>
          <p>Proposals submission is now closed, waiting for admin to start voting session</p>
        </>
        )}

{user && workflow < 3 && workflow >= 1 && (<><br/>{!display ? <button className='button-user' onClick={handleClick}>Show Proposals</button> : <button className='button-user' onClick={handleClick}>Hide Proposals</button>}</>)}

          {display && workflow < 3 ?
            <div><table className='right'>
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
            </table></div> : <></>}

        {user && workflow === 3 && (<>
          <h3>Time to Vote !</h3>

             {disabled ? <p>Thank you for your vote !</p> : 
          
            <form onSubmit={handleSubmit}>
              <select className='input' value={id} onChange={handleChange}>
                <option value="">Select a Proposal</option>
                {propsArray.map((prop) => {
                  return (
                    <option key={prop[0]} value={prop[0][0]}> {prop[0][1]} </option>
                  )
                })}
              </select>
              <input className='button-submit' disabled={disabled} type="submit" value="Confirm" />
            </form>
}
        </>)}

        {user && workflow === 4 && (<><p>Voting session has ended, waiting for admin to tally votes</p><p> You want to retrieve your friend's vote ? </p><input className='input' type='text' placeholder='type the address here, you spy' id='someAddress' /><button className='button-submit' onClick={getVote}>Show it</button><p>{votedFor}</p></>)}

        {user && workflow === 5 && (displayWinner ? <h3>Winning proposal is {winningProp} !</h3> : <><p>Drumrolls... 🥁</p><button className='button-user' onClick={getWinningProp}>Reveal the winning proposal</button></>)}

        

        
        </>
    </div>
   
  </>
  );
}

export default UserDashboard;