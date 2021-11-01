import Modal from '/libs/modal/script.js';
import Snackbar from '/libs/snackbar/script.js';
import download from '/libs/migrater/download.js';

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export default function trialer(dateExpired, hasPerson, isValidToUse) {
	dateExpired = new Date(dateExpired);
	let today = new Date();
	let domainToTrial;
	let dateCreated;
	let isOnExplorer = (new RegExp(/\/explore\?/)).test(location.href);
	let	remainingDays = Math.round((dateExpired - today)/1000/24/60/60);
	
	const $emailInputModal = new Modal({
		modalContainerId: 'emailInputModal'
		, modalTitleText: `{{emailInputModalTitleText}}`
		, modalContentsInnerHTML: `{{emailInputModal}}`
		, modalCancelBtnText: `{{emailInputModalCancelBtnText}}`
		, modalSubmitBtnText: `{{emailInputModalSubmitBtnText}}`
		, modalCancelBtnAction: function(){
			$emailInputModal.destroy();
			window.history.back();
		}
		, modalSubmitBtnAction: async function(){
			let $emailInput = document.getElementById('emailInput');
			let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			
			if(!$emailInput.value) {
				$emailInput.parentElement.classList.replace('default', 'error');
			}
			
			if (!emailRegex.test($emailInput.value)) {
				$emailInput.value = '';
				$emailInput.placeholder = 'Invalid email format';
				$emailInput.addEventListener('keydown', (e) => {
					if(e) {
						$emailInput.parentElement.classList.replace('error', 'default');
					}
				});
				return $emailInput.parentElement.classList.replace('default', 'error');
			}
			
			if($emailInput.value) {
				const response = await fetch('/trial/create', {
					method: 'POST'
					, headers: {
						'Content-Type': 'application/json'
						, 'Accept' : 'application/json'
					}
					, body: JSON.stringify({
						subdomain: location.hostname.split('.')[0]
						, email: $emailInput.value
						, name: capitalizeFirstLetter($emailInput.value.split('@')[0])
						, loginUser: true
						, isFree : false
						, productName : `{{qoomProductName}}`
					})
				});
				
				
				const json = await response.json();
				
				if (json.taken) {
					$emailInput.parentElement.classList.replace('default', 'error');
					$emailInput.value = '';
					$emailInput.placeholder = 'This email already exists.';
					$emailInput.addEventListener('keydown', (e) => {
						if(e) {
							$emailInput.parentElement.classList.replace('error', 'default');
						}
					});
				} else {
					domainToTrial = json.domainName;
					dateCreated = json.dateCreated;
					$emailInputModal.destroy();
					location.href = `{{redirectingPage}}`;
				}
			}
		}
	});
	
	const $welcomeAboardModal = new Modal({
		modalContainerId: 'welcomeAboardModal'
		, modalTitleText: '{{welcomeModalTitleText}}'
		, modalContentsInnerHTML: `{{welcomeModal}}`
		, modalSubmitBtnText: '{{welcomeModalSubmitBtnText}}'
		, modalSubmitBtnAction: function(){
			$welcomeAboardModal.destroy();
			localStorage.welcomeModalShown = true;
		}
	});
	
	const $trialEndModal = new Modal({
		modalContainerId: 'trialEndModal'
		, modalTitleText: '{{trialEndModalTitleText}}'
		, modalContentsInnerHTML: `{{trialEndModal}}`
		, modalCancelBtnText: 'Backup'
		, modalCancelBtnAction: function(){
			if(this.tagName === 'BUTTON') download();
		}
		, modalSubmitBtnText: 'Sign up Qoom'
		, modalSubmitBtnAction: upgradeTrial
	});
	
	const $upgradeSnackbar = new Snackbar({
		mode: 'message'
		, id: 'upgradeSnackbar'
		, message: `{{upgradeSnackbarMessage}}`
		, position: isOnExplorer ? 'bottom-left' : 'bottom-left'
		, alertActions: [
			{
				name: '{{upgradeSnackbarAction1Text}}'
				, onclick: function(){
					$upgradeSnackbar.destroy();
					localStorage.dateHideClicked = new Date().toLocaleDateString();
				}
			}, {
				name: '{{upgradeSnackbarAction2Text}}'
				, onclick: function(){
					upgradeTrial();
				}
			}
		]
	});
	
	function upgradeTrial(){
		location.href = 'https://www.qoom.io/pricing';
	}
	
	function getFinalDate(dateExpired, days){
		if(isNaN(dateExpired)) return undefined;
		var finalDate = new Date(dateExpired);
		finalDate.setDate(finalDate.getDate() + days);
		finalDate = finalDate.toLocaleDateString();
		return finalDate;
	};
	
}