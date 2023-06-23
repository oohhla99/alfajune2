import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { useContractRead, useAccount } from "wagmi";
import contractABI from "../abis/abi.json";
import { toast } from "react-toastify";
// import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ConnectionButton } from "../components/ConnectButton";
import "./DappGate.css";

const DappGate = (props) => {
  const { address, isConnected } = useAccount();
  const [wl, setWl] = useState([]);

  // fetch google sheets data
  useEffect(() => {
    Papa.parse(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTOLiJC_tIwGjNwIhi7is89jMStUF7ZEXbqRoZynngsqdbxzG8O3APj14gXd_E6f-UBVCpyiCt_rGbe/pub?gid=0&single=true&output=csv",
      {
        download: true,
        header: true,
        complete: function (results) {
          console.log(results.data);
          const wallets = results.data.map((row) => row["Wallet Addresses"]); // now using the named column header directly
          const validWallets = wallets.filter((wallet) => wallet); // this will remove any undefined or empty values
          setWl(validWallets);
        },
      }
    );
  }, []);

  let navigate = useNavigate();

  // Alfa Token mainnet address is the contract address here
  const contractAddress = "0x128ad1ad707c3B36e6F2ac9739f9dF7516FdB592";
  //ALphawolves NFT ca
  const contractAddress2 = "0xdcd6d4a557ff208f01D4c2b5Bf829078622C37c5";

  const { data: balanceOfCheck } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: "balanceOf",
    args: [address],
  });

  const { data: balanceOfCheck2 } = useContractRead({
    address: contractAddress2,
    abi: contractABI,
    functionName: "balanceOf",
    args: [address],
  });

  console.log(balanceOfCheck, "the balance");
  console.log(balanceOfCheck2, "the balance");
  console.log(address, "the address");

  //converting hex to normal number // note - .toLocalString("en")
  const hexToDecimal = (hex) => parseInt(hex, 16);
  // const bal = balanceOfCheck
  // console.log(bal)

  const balance = balanceOfCheck ? hexToDecimal(balanceOfCheck._hex) / 1e18 : 0;
  const balance2 = parseInt(balanceOfCheck2, 16);
  console.log(balance);
  console.log(balance2);

  // if user wallet is not connected, this function will be called to the user attention
  const connectWalletError = () => {
    if (!isConnected) {
      toast.warning("Please connect your wallet first to continue", {
        position: toast.POSITION.TOP_LEFT,
        theme: "dark",
        autoClose: 5000,
      });
    }
  };

  // if user wallet is not in the WL, the warning appears. If they are they proceed to dapp
  const enterDapp = () => {
    if (!address) {
      // handle case when address is not defined
      return;
    }

    const lowerCaseAddress = address.toLowerCase();
    const lowerCaseWhitelist = wl.map((wallet) => wallet.toLowerCase());

    if (lowerCaseWhitelist.includes(lowerCaseAddress)) {
      localStorage.setItem("isWhitelisted", "true"); // set isWhitelisted flag in localStorage
      navigate("/airdrop-bot");
    } else {
      toast.warning(
        "Your wallet is not whitelisted. Please proceed by whitelisting your wallet address.",
        {
          position: toast.POSITION.TOP_CENTER,
          theme: "dark",
          autoClose: 5000,
        }
      );
    }
  };

  return (
    <div className="page-container">
      <Helmet>
        <title>alfa.dapp</title>
        <meta property="og:title" content="alfa.dapp" />
      </Helmet>
      <ConnectionButton></ConnectionButton>
      <div className="page-banner">
        <img
          src="/playground_assets/dappper.svg"
          alt="image"
          className="page-image"
        />
        <h1 className="page-text">alfa.dapp</h1>
        <span className="page-text1">v1.1</span>
        <span className="page-text2">
          You need to whitelist your wallet first.
        </span>
        <a
          href="https://whitelist.alfasociety.io/"
          target="_blank"
          rel="noreferrer noopener"
          className="page-link"
        >
          Whitelist Wallet Address
        </a>
        <button
          className="page-button1 themebutton button hover-white"
          onClick={!isConnected ? connectWalletError : enterDapp}
        >
          enter dapp
        </button>
      </div>
    </div>
  );
};

export default DappGate;
