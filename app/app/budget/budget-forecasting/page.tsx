
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
export default function  BudgetForecasting(){
    return(
        <div>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:account-balance-wallet-outline" value={5200000} title="Current Budget" description="Approved budget for FY 2026" />
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:payments-outline" value={3400000} title="Current Commitments" description="Budget currently reserved" />
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:contract-outline" value={1800000} title="Available Budget" description="Remaining budget available" />
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:account-balance-wallet-outline" value={4600000} title="Project Usage" description="Forecasted budget consumption" />
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:payments-outline" value={600000} title="Project Surplus" description="Expected remaining balance" />
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:contract-outline" value={0} title="Project Shortfall" description="Additional budget required" />
                <div className="md:col-span-3">
                    
    
                </div>
            </div>
        </div>
    )
}