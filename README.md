## wealthwi.se

### Model

This code is a simulation that runs a number of times (SAMPLES) and calculates the expected outcome of buying a house and investing in bonds or renting and investing in bonds. The inputs for the simulation are read from a JSON file, which is parsed using the parse function. The run function simulates a single run, and uses helper functions from run.helpers to calculate costs and returns at each step of the simulation. The simulation keeps track of the house price, the mortgage balance, the investment portfolio, and the monthly expenses and returns. It also takes into account the possibility of a property crash and the option to sell the property and move after a certain number of years. At the end of the simulation, the final portfolio value is compared to the final rent value to determine whether buying or renting was more profitable.
